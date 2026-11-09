# Yab762/MAI-UI-2B5

## Resumen

MAI-UI-2B5 es la variante de 2.127.532.032 parametros de MAI-UI, una familia de agentes GUI (interfaz grafica de usuario) presentada por el autor Yab762 como "foundation GUI agents" para interaccion real con dispositivos. La familia completa incluye variantes de 2B, 8B, 32B y 235B-A22B, y este repositorio publica los pesos en formato safetensors bajo arquitectura `qwen3_vl`, lo que indica un modelo multimodal vision-lenguaje derivado de la familia Qwen3-VL. El modelo esta pensado para tareas de grounding de interfaz (localizar elementos en pantalla a partir de instrucciones en lenguaje natural) y navegacion movil autonoma.

La propuesta tecnica del autor se articula en torno a cuatro problemas de despliegue real: falta de interaccion nativa agente-usuario, limites de la operacion exclusivamente sobre UI, ausencia de una arquitectura practica de despliegue y fragilidad en entornos dinamicos. Para abordarlos, la model card describe un pipeline de datos auto-evolutivo que amplia los datos de navegacion con interacciones de usuario y llamadas a herramientas MCP, un sistema nativo de colaboracion dispositivo-nube que enruta la ejecucion segun el estado de la tarea y un framework de RL online con optimizaciones para escalar entornos paralelos y longitud de contexto.

La relevancia de esta ficha es doble: por un lado, MAI-UI reporta resultados SOTA en benchmarks de grounding y navegacion movil (73,5% en ScreenSpot-Pro, 76,7% en AndroidWorld); por otro, este repositorio concreto es la variante pequena (2B) de esa familia, con licencia Apache 2.0, lo que la hace candidata a despliegue en dispositivo. No obstante, el repositorio no incluye pipeline declarado, no tiene descargas ni likes y no publica idiomas soportados, por lo que la informacion practica de uso es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje, tag `qwen3_vl` (Qwen3-VL) |
| Parametros totales | 2.127.532.032 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio declara el tag `qwen3_vl`, lo que situa el modelo en la arquitectura Qwen3-VL: un transformer multimodal que procesa simultaneamente imagenes (capturas de pantalla de interfaces) y texto (instrucciones y estado de la tarea). El dato de parametros totales (2.127.532.032) corresponde a la variante 2B de la familia MAI-UI. El tamano del repositorio es de 4,3 GB, coherente con pesos en precision de 16 bits para ese numero de parametros.

Segun la model card, el entrenamiento se apoya en tres pilares. Primero, un pipeline de datos auto-evolutivo que expande los datos de navegacion para incluir interaccion usuario-agente y llamadas a herramientas MCP (Model Context Protocol). Segundo, un sistema de colaboracion dispositivo-nube que decide dinamicamente si ejecutar en el dispositivo o en la nube segun el estado de la tarea y la sensibilidad de los datos. Tercero, un framework de RL online con optimizaciones para escalar entornos paralelos y longitud de contexto; los experimentos del autor muestran ganancias al pasar de 32 a 512 entornos paralelos (+5,2 puntos) y al ampliar el presupuesto de pasos de entorno de 15 a 50 (+4,3 puntos). No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO mas alla del RL online descrito.

## Capacidades

- Grounding de interfaz grafica: localizacion de elementos UI a partir de instrucciones en lenguaje natural, con resultados reportados de 73,5% en ScreenSpot-Pro, 91,3% en MMBench GUI L2, 70,9% en OSWorld-G y 49,2% en UI-Vision.
- Navegacion movil autonoma: ejecucion de tareas multi-paso sobre Android, con 76,7% en AndroidWorld y 41,7% en MobileWorld.
- Procesamiento multimodal: entrada de capturas de pantalla junto con texto, al estar basado en Qwen3-VL.
- Llamadas a herramientas MCP: el pipeline de datos incluye tool calls MCP, lo que sugiere soporte de integracion con herramientas externas.
- Interaccion agente-usuario nativa: la model card identifica la interaccion con el usuario como una de las capacidades objetivo del entrenamiento.
- Colaboracion dispositivo-nube: capacidad de enrutar la ejecucion entre on-device y cloud segun estado de tarea y sensibilidad de datos.
- Razonamiento multi-paso en entornos dinamicos: entrenado con RL online sobre entornos interactivos.

## Casos de uso

- Automatizacion de pruebas de interfaz movil: el modelo puede localizar elementos y ejecutar flujos de navegacion sobre AndroidWorld, lo que permite generar pruebas end-to-end de aplicaciones sin scripting manual de coordenadas.
- Asistente de accesibilidad en dispositivo: al ser la variante de 2B con licencia Apache 2.0, puede desplegarse localmente para interpretar la pantalla y guiar al usuario en tareas de navegacion, con el enrutado dispositivo-nube reduciendo llamadas a API en mas del 40% segun el autor.
- Agente de soporte remoto: el modelo puede leer capturas de pantalla del dispositivo del usuario e identificar el elemento o paso siguiente, usando grounding sobre UI para senalar acciones concretas.
- RPA (automatizacion robotica de procesos) sobre aplicaciones moviles: combinado con un entorno de ejecucion Android, puede encadenar pasos de navegacion multi-pantalla para tareas repetitivas como rellenar formularios o consultar estados.
- Enrutado hibrido en produccion: el framework de colaboracion dispositivo-nube descrito permite decidir en tiempo de ejecucion si una tarea sensible se resuelve en el dispositivo (2B) y las no sensibles se delegan a una variante mayor en la nube, mejorando el rendimiento on-device un 33% segun el autor.
- Evaluacion de agentes GUI: la variante 2B sirve como baseline ligero para comparar tecnicas de grounding y navegacion frente a las variantes 8B, 32B y 235B-A22B de la misma familia.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la familia MAI-UI en su conjunto; no se especifica de forma explicita que correspondan a la variante 2B5. Se reproducen tal cual:

| Benchmark | Resultado MAI-UI | Referencia citada |
|---|---|---|
| ScreenSpot-Pro | 73,5% | supera a Gemini-3-Pro y Seed1.8 |
| MMBench GUI L2 | 91,3% | no disponible |
| OSWorld-G | 70,9% | no disponible |
| UI-Vision | 49,2% | no disponible |
| AndroidWorld | 76,7% | supera a UI-Tars-2, Gemini-2.5-Pro y Seed1.8 |
| MobileWorld | 41,7% | competitivo con frameworks agénticos basados en Gemini-3-Pro |

Ademas, los experimentos de RL online reportan +5,2 puntos al escalar de 32 a 512 entornos paralelos y +4,3 puntos al pasar de 15 a 50 pasos de entorno. No hay datos desagregados por tamano de modelo, por lo que no es posible atribuir estos numeros a la variante de 2B.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4,3 GB en precision de 16 bits (coincide con el tamano del repo); en cuantizacion de 8 bits se situaria en torno a 2,2 GB y en 4 bits en torno a 1,1 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM deberia poder cargar los pesos en fp16; para cuantizaciones de 4 bits bastaria con 4 GB.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: no se documentan en el repositorio. Al ser un modelo `qwen3_vl`, los runners habituales de la familia Qwen3-VL (vLLM, llama.cpp con soporte multimodal, TGI) son candidatos, pero no hay confirmacion del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAI-UI-2B5 (este) | 2,13B | no disponible | Agente GUI multimodal | Apache 2.0 | Hugging Face, sin descargas declaradas |
| MAI-UI 8B / 32B / 235B-A22B | no disponible | no disponible | Agente GUI multimodal | Apache 2.0 (segun model card) | Misma familia, no se detalla repo |
| UI-Tars-2 | no disponible | no disponible | Agente GUI | no disponible | Citado como referencia en benchmarks |
| Gemini-2.5-Pro / Gemini-3-Pro | no disponible (propietario) | no disponible | Modelo generalista con uso agéntico | Propietaria | API de Google |

La comparativa se limita a los modelos citados en la propia model card. No se dispone de datos de parametros, contexto ni licencia de las alternativas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio no declara pipeline, idiomas soportados ni tipos de cuantizacion, lo que dificulta evaluar su uso en produccion sin pruebas adicionales.
- No se especifica que los benchmarks reportados correspondan a la variante 2B; los resultados SOTA de la model card pueden referirse a las variantes mayores de la familia.
- Ausencia de descargas y likes: no hay evidencia de uso comunitario ni de validacion independiente de los pesos publicados.
- Riesgo de alucinacion en la identificacion de elementos UI: el grounding sobre capturas de pantalla puede fallar en interfaces con elementos visualmente similares o en resoluciones no vistas durante el entrenamiento.
- Dependencia de la calidad de la captura de pantalla y del estado dinamico de la interfaz; la model card menciona explicitamente la fragilidad en entornos dinamicos como uno de los retos que el modelo intenta mitigar, no como un problema resuelto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion de seguridad para despliegues autononos sobre dispositivos de usuarios.
- No hay informacion sobre sesgos, composicion del dataset ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Yab762/MAI-UI-2B5
- Imagen de overview de la model card: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/_ibfeHy_31ZRanQ3xxlnn.png
- Grafica ScreenSpot-Pro: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/oNggS-XoVZSiiLitn8nD3.jpeg
- Grafica UI-Vision: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/8t_oRozJ51aw5rKojqlOu.jpeg
- Grafica MMBench: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/dwc8np4JLxTWoNS8wu18p.jpeg
- Grafica OSWorld-G: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/lff2k7ZkMgCrgt3lPZChb.jpeg
- Grafica AndroidWorld: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/EUXl1osfQ26WGYcV4hhsG.jpeg
- Grafica MobileWorld: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/gsbjUtIoUFWyR6Nw3qRz6.jpeg
- Grafica RL online: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/BO8GnYXsJ51ZTvVRLxn6u.jpeg
- Grafica entornos RL: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/39mhKfUvt7159dKM_oeGa.jpeg
- Grafica colaboracion dispositivo-nube: https://cdn-uploads.huggingface.co/production/uploads/63525c3a6cfb8f1498127a34/Fm2PPxbRpASfdvVBxkjLw.jpeg
