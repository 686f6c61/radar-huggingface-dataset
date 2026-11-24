# tencent/TiMiHOKGameTranslator

## Resumen

TiMiHOKGameTranslator es un proyecto de ingenieria open source publicado por el equipo del juego Honor of Kings (王者荣耀) del estudio TiMi L1 de Tencent Games, orientado a la localizacion multilingue de videojuegos. No se trata de un modelo de lenguaje en sentido estricto, sino de una cadena de herramientas completa que cubre el ciclo de traduccion automatica y control de calidad (LQA) de textos de juego: traduccion, captura en tiempo de ejecucion, reconstruccion en editor y deteccion automatica de defectos de localizacion.

El nucleo de traduccion no es un modelo propio del repositorio, sino que delega en la familia de modelos de traduccion Hunyuan MT3 (Hy-MT3) de Tencent, que el proyecto declara como ya adaptada. El repositorio incluye ademas un conjunto de evaluacion abierto, GameTrans_EvalSet, con 4500 segmentos de texto en chino procedentes de 15 generos de videojuegos, cada uno acompanado de glosarios terminologicos para 14 idiomas de destino.

Su relevancia actual reside en el problema concreto que aborda: en localizacion de juegos los fallos tipicos no son solo de traduccion, sino de desbordamiento de caja (texto que no cabe en la UI), claves sin traducir, terminos propios inconsistentes y solapamientos. La propuesta del proyecto es capturar una unica vez la linea base en chino y reconstruir despues cualquier idioma destino en el editor, evitando reejecutar el juego y rehacer capturas por cada idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena de herramientas (plugins Unity/UE, plataforma web Django) que invoca modelos de traduccion externos Hunyuan MT3; no es un modelo neuronal unico |
| Parametros totales | no disponible (el repositorio no publica pesos de un modelo propio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 14 idiomas de destino en el conjunto de evaluacion: en, vi, th, id, zh-Hant, fr, de, ru, ja, pt-BR, ko, ar, es, tr; el modelo Hunyuan MT3 subyacente cubre 33 idiomas |
| Licencia | Apache 2.0 (segun el badge de la model card; el campo de licencia de Hugging Face figura como no disponible) |
| Formato de pesos | no disponible; el repositorio contiene codigo, plugins y datos (4,5 GB), no pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ni distribuye un modelo fundacional propio. La traduccion se apoya en Hunyuan MT3, un modelo de traduccion de Tencent con capacidades de instruccion: intervencion terminologica, control de estilo, preservacion de delimitadores y traduccion de datos estructurados (JSON, XML). Esa capacidad de instruccion es la que permite manejar marcadores de posicion, etiquetas de texto enriquecido y nombres propios del juego sin romper el formato.

La parte de ingenieria del proyecto se organiza en cinco modulos: la cadena de traduccion (que produce una tabla clave a traduccion), el conjunto de evaluacion GameTrans_EvalSet, plugins de captura para Unity y Unreal Engine, plugins de reconstruccion en editor para ambos motores y la plataforma web LQA_WMP. La plataforma usa Python 3.12 con Django 5.1, Celery, MySQL 8 y Redis 7 en el backend, y Vue 3 con Vite 5 y Element Plus en el frontend, con un servicio de reconocimiento en Flask y despliegue mediante Docker Compose. La deteccion de defectos combina comparacion de capturas con OCR mediante una capa de adaptacion intercambiable con 9 implementaciones.

La innovacion metodologica destacable es el principio de "capturar una vez en chino, reconstruir en cualquier idioma": los plugins de captura registran el arbol de nodos de UI, las coordenadas, los estilos, el texto y la clave de localizacion, sin traducir; los plugins de reconstruccion vuelven a renderizar la escena en el editor aplicando la tabla de traducciones y generan una imagen de restauracion junto con las posiciones de las cajas de texto, que el servicio de IA analiza para localizar traducciones ausentes, erroneas, desbordadas o solapadas. El modelo de integracion es "nucleo generico mas adaptador de proyecto": los componentes propios de localizacion o texto enriquecido se registran mediante un extractor o restaurador especifico sin modificar el nucleo.

## Capacidades

- Traduccion automatica de textos de juego en 14 idiomas de destino a partir de chino, con soporte de glosarios terminologicos por idioma.
- Intervencion terminologica y control de estilo mediante instrucciones al modelo Hunyuan MT3.
- Preservacion de marcadores de posicion, etiquetas de texto enriquecido y estructuras JSON/XML durante la traduccion.
- Captura en tiempo de ejecucion de la jerarquia de nodos de UI, coordenadas, estilos, textos y claves de localizacion en Unity y Unreal Engine.
- Deteccion de visibilidad real de cada texto mediante mapa de identificadores coloreado y diferencia de pixeles entre la captura con texto y la captura de fondo.
- Reconstruccion en editor de la interfaz en el idioma destino, con sustitucion de traducciones, variantes de fuente y correccion manual de visibilidad.
- Deteccion automatica por IA de cinco clases de defecto: traduccion ausente, traduccion erronea, desbordamiento de caja, clave ausente y solapamiento.
- Gestion de defectos con envio individual, por lotes o automatico a Bugzilla 5.x y Zentao, y verificacion de regresion posterior.
- Orquestacion de tareas de reconstruccion mediante Webhook compatible con Jenkins, GitLab CI o servicios propios.
- Separacion multiinquilino por proyecto con cuatro roles (superadministrador, administrador de proyecto, probador, desarrollador) y tokens de acceso por API.

## Casos de uso

- Localizacion de un juego a varios idiomas antes de la revision humana: la cadena de traduccion genera la tabla clave a traduccion para los 14 idiomas soportados y el equipo de localizacion revisa solo las entradas marcadas por la plataforma, reduciendo el volumen de revision manual previa a la ingestion.
- Deteccion de desbordamiento de caja en interfaces con texto expansible: la reconstruccion en editor aplica la traduccion real sobre el diseno original y el servicio de IA compara la caja de texto con el area disponible, de modo que un texto aleman o ruso mas largo que el chino se detecta antes de publicar.
- Control de terminologia en juegos con nombres propios densos: los glosarios por idioma del conjunto de evaluacion y la intervencion terminologica de Hunyuan MT3 permiten fijar la traduccion de habilidades, objetos y nombres de personaje y verificar su consistencia en toda la base de textos.
- Automatizacion de LQA en integracion continua: la plataforma dispara tareas de reconstruccion por Webhook desde Jenkins o GitLab CI, de forma que cada compilacion nocturna regenera las capturas en todos los idiomas y abre incidencias automaticamente en Bugzilla o Zentao.
- Verificacion de regresion tras corregir traducciones: una vez corregida una entrada, la plataforma relanza la reconstruccion del mismo conjunto de pantallas y comprueba que el defecto ya no aparece, sin necesidad de repetir la partida manual.
- Auditoria de cobertura de localizacion: la deteccion de claves ausentes y de cadenas sin traducir permite medir el porcentaje de cobertura por idioma y por pantalla antes de la entrega, sobre la base de capturas de la version en chino.
- Evaluacion comparativa de motores de traduccion: GameTrans_EvalSet, con 4500 segmentos en 15 generos (MOBA 410, MMO 324, terror 293, casual 333, lucha 315, carreras 290, mundo abierto 333, accion y aventura 309, sandbox 289, shooter 306, RPG 305, simulacion 286, SLG 276, estilo chino 255, juegos de mesa 176), sirve para comparar modelos de traduccion en dominio de videojuego con glosarios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio no incluye pesos de modelo, por lo que no aplica una estimacion de VRAM para inferencia del propio proyecto; el consumo depende del modelo Hunyuan MT3 que se despliegue en la cadena de traduccion, cuyas especificaciones no figuran en la informacion disponible.
- La plataforma LQA_WMP se despliega con Docker Compose y requiere Python 3.12, Django 5.1, Celery, MySQL 8 y Redis 7, ademas de un servicio Flask de reconocimiento; no se detallan requisitos minimos de CPU, RAM o GPU para ese servicio.
- El servicio de reconocimiento usa OCR con una capa de adaptacion intercambiable de 9 implementaciones; el coste de computo depende de la implementacion elegida y no se publica.
- Los plugins de captura y reconstruccion se ejecutan en el editor o en el dispositivo de prueba (Win64, Mac, iOS, Android para Unity y Unreal), no en un servidor de inferencia.
- Opciones de despliegue documentadas: Docker Compose para la plataforma; plugins nativos para Unity y Unreal Engine; herramienta de carga en Python para Unreal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| TiMiHOKGameTranslator (Tencent) | Cadena de herramientas de localizacion y LQA | 14 de destino en el conjunto de evaluacion; 33 en el modelo subyacente | Apache 2.0 | Traduccion mas captura, reconstruccion y deteccion de defectos de UI |
| Hunyuan MT3 (Tencent) | Modelo de traduccion | 33 | no disponible en la informacion proporcionada | Traduccion con instrucciones, terminologia y estructuras |
| Herramientas genericas de localizacion de motores (Unity/Unreal) | Plugins de internacionalizacion | Segun proyecto | Segun motor | Gestion de claves y sustitucion de cadenas, sin deteccion visual de defectos |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse como sustituto de un LLM o de un modelo de traduccion; requiere desplegar aparte Hunyuan MT3 u otro motor compatible con la cadena.
- La calidad de la traduccion depende integramente del modelo externo invocado; el repositorio no publica metricas de calidad propias.
- La deteccion de defectos se basa en OCR y comparacion de pixeles, por lo que puede fallar con fuentes decorativas, texto sobre fondos complejos o efectos de particulas.
- El conjunto de evaluacion cubre 14 idiomas de destino y fuente en chino; no se documenta cobertura para pares distintos de chino a X.
- La licencia figura como Apache 2.0 en el badge de la model card, pero el campo de licencia de Hugging Face aparece como no disponible; conviene verificar los terminos antes de uso comercial.
- La reconstruccion depende de que el proyecto registre adaptadores para sus componentes propios de localizacion y texto enriquecido; sin esa integracion, el nucleo generico puede no extraer o restaurar correctamente el texto.
- El repositorio ocupa 4,5 GB e incluye plugins, plataforma y datos; no se especifican requisitos de infraestructura para el servicio de reconocimiento en produccion.
- No se publican sesgos conocidos, tasas de alucinacion ni limites de contexto del modelo subyacente en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tencent/TiMiHOKGameTranslator
- Coleccion de modelos Hunyuan MT3: https://huggingface.co/collections/tencent/hy-mt3
- Subrepositorio de traduccion: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/TiMi_HOK_Game_Translator
- Conjunto de evaluacion GameTrans_EvalSet: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/GameTrans_EvalSet
- Plugin de captura para Unity: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/Unity_LQATool_Plugin
- Plugin de reconstruccion para Unity: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/Unity_LQARestore_Plugin
- Plugin de captura para Unreal Engine: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/UE_LQATool_Plugin
- Herramienta de carga para Unreal Engine: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/UE_LQAUpload_Tool
- Plugin de reconstruccion para Unreal Engine: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/UE_LQARestore_Plugin
- Plataforma web LQA_WMP: https://huggingface.co/tencent/TiMiHOKGameTranslator/tree/main/timi_hok_game_translator/LQA_WMP
- Sitio corporativo de Tencent: https://www.tencent.com/
- Tencent Games: https://www.tencent.com/products/tencent-games/
