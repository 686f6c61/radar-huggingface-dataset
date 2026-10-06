# x0rium/fakedetect-windows

## Resumen

FakeDetect para Windows es un paquete de distribucion publicado en HuggingFace por el usuario x0rium que empaqueta un detector local de texto generado por maquina para ruso e ingles. No se trata de un modelo de lenguaje generativo, sino de un clasificador de deteccion de texto sintetico (AI-text-detection) distribuido como instalador ejecutable para Windows x64, con runtime ONNX Runtime y cuantizacion INT8 como parte del stack declarado en las etiquetas del repositorio.

La propuesta del autor es evitar la instalacion manual de dependencias: el instalador incluye un motor compacto en INT8 que funciona en local sin necesidad de instalar Python, Git ni CUDA Toolkit por separado. Requiere Windows de 64 bits (10 version 1809 o superior, recomendado Windows 11) y una tarjeta grafica NVIDIA con driver actualizado. El paquete ocupa 1,94 GiB y el autor indica que se reserven al menos 6 GB libres durante la instalacion.

El repositorio no incluye informacion sobre la arquitectura interna del detector, el numero de parametros, la longitud de contexto ni los datos de entrenamiento. La model card menciona que existe un modelo mayor denominado GigaCheck que no se distribuye con el instalador y que el usuario puede descargar aparte desde la propia interfaz, pero no se aportan especificaciones tecnicas sobre el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repo declara ONNX Runtime con cuantizacion INT8) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (motor compacto incluido en el instalador) |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (runtime ONNX Runtime; el artefacto publicado es un instalador .exe, no pesos sueltos) |
| Tamano del repositorio | 2,1 GB |
| Tamano del instalador | 2 080 866 671 bytes (1,94 GiB), version 0.2.3 |
| Plataforma | Windows x64 (10 build 1809+ o Windows 11) |
| Aceleracion | GPU NVIDIA con driver actualizado |

## Arquitectura y entrenamiento

No hay informacion publicada en el repositorio sobre la arquitectura del detector, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Las unicas pistas tecnicas son las etiquetas del repositorio, que apuntan a un clasificador ejecutado sobre ONNX Runtime y cuantizado a INT8 para reducir el consumo de recursos en el equipo del usuario final.

El autor distingue dos componentes: un motor compacto en INT8 que se instala junto con la aplicacion y un modelo de mayor tamano llamado GigaCheck que el usuario puede descargar de forma opcional desde la interfaz. No se documentan diferencias de arquitectura, rendimiento o requisitos entre ambos, ni se publican pesos, configuraciones de tokenizer o scripts de entrenamiento en el repositorio.

## Capacidades

- Deteccion de texto generado por maquina en ruso e ingles, segun la descripcion del propio autor.
- Ejecucion completamente local: el motor INT8 va incluido en el instalador y no requiere conexion a servicios externos.
- Funcionamiento sin dependencias manuales: no hace falta instalar Python, Git ni CUDA Toolkit por separado.
- Aceleracion por GPU NVIDIA, con el driver del sistema como unico requisito adicional.
- Descarga opcional de un segundo modelo de mayor tamano (GigaCheck) desde la interfaz de la aplicacion.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo de pensamiento. Es, segun la informacion disponible, una herramienta de clasificacion, no un modelo generativo.

## Casos de uso

- Moderacion de contenido en plataformas en ruso e ingles: el clasificador puede marcar textos sospechosos de haber sido generados automaticamente antes de su publicacion, ejecutandose en local para no enviar contenido de usuarios a terceros.
- Verificacion editorial en medios: un redactor o editor puede pasar un articulo por la herramienta para obtener una senal adicional antes de publicarlo, especialmente en flujos donde se reciben colaboraciones externas.
- Deteccion de spam y resenas falsas en comercio electronico: el motor INT8 procesa lotes de resenas en el propio equipo del analista, sin depender de APIs externas ni de cuotas de servicio.
- Revision academica de entregas: docentes pueden comprobar de forma orientativa si un trabajo en ruso o ingles presenta patrones de generacion automatica, siempre como indicio y no como prueba concluyente.
- Filtrado previo en pipelines de datos: antes de incorporar un corpus en ruso o ingles a un proceso de entrenamiento o analisis, la herramienta puede descartar documentos de origen sintetico no deseado.
- Analisis forense de comunicaciones: en investigaciones internas, permite clasificar grandes volumenes de mensajes sin salir del equipo, lo que ayuda a cumplir requisitos de confidencialidad.
- Uso en estaciones de trabajo con GPU NVIDIA modestas o de gama alta: al distribuirse como instalador con un motor INT8, esta pensado para analistas que no quieren montar un entorno Python completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows de 64 bits, version 10 build 1809 o superior; el autor recomienda Windows 11.
- GPU: tarjeta NVIDIA compatible con driver actualizado. No se detalla VRAM minima.
- VRAM estimada para inferencia: no disponible.
- Almacenamiento: al menos 6 GB libres durante la instalacion; el instalador pesa 1,94 GiB.
- Equipo de referencia declarado: el autor indica que el instalador se probo en Windows 11 con una NVIDIA GeForce RTX 4090, cubriendo instalacion limpia, actualizacion sobre version previa, arranque del motor compacto y desinstalacion.
- Cabe en GPU de consumo: no se especifica, pero el requisito de GPU NVIDIA y el uso de INT8 sugieren orientacion a equipos de escritorio con grafica dedicada.
- Opciones de despliegue: instalador .exe (FakeDetect-Setup-0.2.3-x64.exe) con runtime ONNX Runtime. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto, rendimiento ni licencia de este paquete, por lo que no es posible establecer una comparacion cuantitativa fiable con otras alternativas de deteccion de texto generado. El unico modelo relacionado mencionado en la documentacion es GigaCheck, que el propio autor referencia como opcion de mayor tamano descargable aparte, pero sin especificaciones publicadas en este repositorio.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| x0rium/fakedetect-windows | no disponible | no disponible | no disponible | no disponible | Instalador Windows x64 en HuggingFace |
| GigaCheck | no disponible | no disponible | no disponible | no disponible | Mencionado como descarga opcional desde la interfaz |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no declara licencia, por lo que el uso comercial queda en una situacion juridica indeterminada hasta que el autor lo aclare.
- No se publican datos de precision, recall, tasa de falsos positivos ni benchmarks, de modo que no hay evidencia cuantitativa de su fiabilidad como detector.
- Cobertura limitada a ruso e ingles; no se documenta soporte para otros idiomas.
- Un detector de texto generado es una herramienta probabilistica: puede clasificar como sintetico un texto humano y viceversa. No deberia usarse como prueba concluyente en contextos academicos, laborales o legales.
- El instalador no esta firmado con certificado Authenticode, por lo que Windows SmartScreen puede avisar de "editor desconocido". El autor proporciona un SHA-256 y un manifiesto JSON para verificar la integridad del archivo.
- El ejecutable requiere una GPU NVIDIA; no se documenta soporte para AMD, Intel ni ejecucion exclusiva en CPU.
- No se detalla el tratamiento de datos: al ser una herramienta local, el procesamiento ocurre en el equipo, pero la descarga opcional de GigaCheck implica trafico de red que conviene revisar.
- El contacto indicado en la model card es una direccion de correo personal, sin repositorio de codigo, paper ni canal de incidencias asociado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion sin validacion externa visible.
- El modelo se distribuye como aplicacion de escritorio, no como pesos reutilizables; no es posible integrarlo directamente en un pipeline propio sin pasar por la interfaz o extraer el runtime del instalador.

## Enlaces

- HuggingFace: https://huggingface.co/x0rium/fakedetect-windows
- Instalador FakeDetect 0.2.3 para Windows x64: https://huggingface.co/x0rium/fakedetect-windows/resolve/main/FakeDetect-Setup-0.2.3-x64.exe?download=true
- SHA-256 del instalador: 9e367c4f6b833752f1fc7915b9cf58127dfd8b666b1571f9063f09cb2c9917a8
- Contacto indicado por el autor: nz123@rambler.ru
