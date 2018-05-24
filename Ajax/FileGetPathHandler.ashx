<%@ WebHandler Language="C#" Class="FileGetPathHandler" %>    
using System;    
using System.Web;    
     
public class FileGetPathHandler : IHttpHandler  
{    
    public void ProcessRequest (HttpContext context)  
    {
		string filePath = context.Server.MapPath("../uploads/");
		string folderpath = context.Request["folderpath"];
		folderpath = filePath + folderpath;
        string imgPaths = "";
        if (System.IO.Directory.Exists(folderpath))
        {
            string filetype = context.Request["filetype"];
            string filefolder = "";
            if (filetype == ".jpeg")
            {
                filefolder = "picture";
            }
            if (filetype == ".mp3")
            {
                filefolder = "audio";
            }
            System.IO.DirectoryInfo dirInfo = new System.IO.DirectoryInfo(folderpath);//imgPath            

            foreach (System.IO.FileInfo item in dirInfo.GetFiles())
            {
                if (imgPaths == "")
                {
                    imgPaths = item.FullName.Replace(context.Server.MapPath("../"), "");
                }
                else
                {
                    imgPaths = imgPaths + ";" + item.FullName.Replace(context.Server.MapPath("../"), "");
                }
            }
        }
        context.Response.ContentType = "text/plain";
        context.Response.Write(imgPaths);
		     
    } 
    
    public bool IsReusable  
    {    
        get   
        {    
            return false;    
        }    
    }    
     
}   