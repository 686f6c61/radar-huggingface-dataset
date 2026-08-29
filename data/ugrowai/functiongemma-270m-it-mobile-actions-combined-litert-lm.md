# UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Combined-litert-lm

## Resumen

FunctionGemma-270M-it-Mobile-Actions-Combined-litert-lm es una variante del modelo FunctionGemma de Google, desarrollada por UGrowAI, que ha sido fine-tuneada sobre el dataset de acciones móviles de Google (mobile-actions) y un conjunto extendido de herramientas móviles. El modelo base, FunctionGemma-270M-it, es una versión ligera de 270 millones de parámetros basada en la arquitectura Gemma 3, diseñada específicamente para traducir solicitudes en lenguaje natural en llamadas a funciones ejecutables. Esta versión concreta se distribuye en formato LiteRT (TFLite) para su despliegue en dispositivos móviles, lo que permite ejecutar agentes locales de function calling sin depender de la nube.

La relevancia de este modelo radica en su capacidad para habilitar asistentes y agentes on-device que interpretan comandos de usuario y los convierten en acciones concretas sobre aplicaciones móviles, con una huella de memoria reducida y latencia baja. Al estar basado en Gemma 3, hereda las capacidades de razonamiento y generación de texto del modelo original, pero optimizado para tareas de function calling. El fine-tuning se realizó con una configuración específica (2 épocas, batch size 4, learning rate 1e-5) sobre hardware A100 en aproximadamente 24 minutos, lo que demuestra su accesibilidad para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder-only) |
| Parametros totales | 270 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato LiteRT puede incluir cuantizacion, pero no se especifica) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Gemma (sujeta a los Terminos de Uso de Gemma) |
| Formato de pesos | LiteRT (TFLite) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder-only de 270 millones de parametros, disenado originalmente por Google para tareas de generacion de texto y razonamiento. Sobre esta base, UGrowAI ha realizado un fine-tuning supervisado utilizando el dataset de acciones moviles de Google (google/mobile-actions) y un conjunto extendido de herramientas moviles (AliRGHZ/Mobile-Actions). El entrenamiento se llevo a cabo con la libreria TRL de Hugging Face, empleando una configuracion de 2 epocas, batch size de 4 por dispositivo, 8 pasos de acumulacion de gradiente, learning rate de 1e-5 con scheduler coseno, optimizador AdamW (fused) y precision bfloat16. Se habilito gradient checkpointing y se aplico una funcion de perdida solo sobre las completaciones (completion only loss), lo que significa que el modelo se entrena unicamente en las salidas generadas, no en los prompts. El entrenamiento se realizo en una GPU A100 de Google Colab con un tiempo total de aproximadamente 24 minutos.

La innovacion principal de FunctionGemma reside en su especializacion para function calling: el modelo aprende a generar estructuras de llamada a funciones (nombres de funciones, argumentos, etc.) a partir de instrucciones en lenguaje natural. En esta variante LiteRT, el modelo se convierte a un formato optimizado para inferencia en dispositivos moviles, lo que permite su integracion en aplicaciones Android o iOS mediante el runtime LiteRT.

## Capacidades

- Generacion de texto y razonamiento basico, heredados de Gemma 3.
- Function calling: traduce solicitudes en lenguaje natural a llamadas a funciones estructuradas (por ejemplo, abrir una aplicacion, enviar un mensaje, realizar una busqueda).
- Ejecucion de acciones moviles: puede interpretar comandos como "abre la camara" o "envia un mensaje a Juan" y generar la llamada de funcion correspondiente.
- Soporte para agentes locales: al ser un modelo pequeno y optimizado para on-device, puede integrarse en agentes que operan sin conexion a internet.
- Capacidad multilingue limitada: aunque la model card indica ingles, el modelo base Gemma 3 tiene soporte multilingue, pero no se especifica si el fine-tuning preserva esa capacidad.
- No se mencionan capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistentes de voz en dispositivos moviles: el modelo puede procesar comandos de voz transcritos a texto y convertirlos en acciones como abrir aplicaciones, configurar alarmas o enviar mensajes, todo localmente en el dispositivo.
- Automatizacion de tareas en apps de productividad: por ejemplo, un usuario puede decir "crea una reunion para manana a las 10" y el modelo genera la llamada a la funcion correspondiente de la aplicacion de calendario.
- Accesibilidad: personas con movilidad reducida pueden controlar su telefono mediante comandos de voz o texto, gracias a la capacidad de traducir lenguaje natural a acciones concretas.
- Agentes de soporte en apps de mensajeria: el modelo puede interpretar solicitudes de los usuarios y ejecutar funciones internas de la aplicacion, como buscar contactos, enviar archivos o gestionar notificaciones.
- Prototipado rapido de agentes moviles: desarrolladores pueden integrar este modelo en sus aplicaciones para anadir capacidades de control por lenguaje natural sin necesidad de servicios en la nube, reduciendo costes y latencia.
- Pruebas de concepto en investigacion: al ser un modelo pequeno y de facil fine-tuning, sirve como base para experimentar con nuevas tareas de function calling en entornos moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo especifico. El unico dato de rendimiento mencionado es el tiempo de entrenamiento (~24 minutos en A100), pero no hay metricas de calidad de las llamadas a funciones ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 270 millones de parametros en formato LiteRT, esta disenado para ejecutarse en dispositivos moviles con recursos limitados. No se especifican requisitos exactos de VRAM, pero se estima que puede funcionar en smartphones con al menos 2-4 GB de RAM disponible.
- GPU recomendadas: no aplica para despliegue on-device; el entrenamiento se realizo en una A100, pero la inferencia no requiere GPU dedicada.
- Compatible con consumer GPU: si se desea ejecutar en un ordenador, una GPU con 4-6 GB de VRAM seria suficiente para inferencia en FP16, aunque el formato LiteRT esta pensado para CPU/GPU moviles.
- Opciones de despliegue: LiteRT (TFLite) para aplicaciones moviles, siguiendo las instrucciones de Google en ai.google.dev/edge/litert-lm/python. Tambien se puede cargar en frameworks como llama.cpp si se convierte a GGUF, aunque no se proporciona esa conversion.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo pequeno, se espera una latencia de decenas de milisegundos en dispositivos moviles modernos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| FunctionGemma-270M-it (base) | 270M | no disponible | Gemma | safetensors | Function calling general |
| FunctionGemma-270M-it-Mobile-Actions (litert-community) | 270M | no disponible | Gemma | LiteRT | Function calling para acciones moviles |
| UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Combined-litert-lm | 270M | no disponible | Gemma | LiteRT | Function calling para acciones moviles (combinado) |

No se dispone de datos de rendimiento comparativo. La diferencia principal entre las variantes es el dataset de fine-tuning: la version de litert-community usa solo google/mobile-actions, mientras que la de UGrowAI combina ese dataset con el extendido de AliRGHZ/Mobile-Actions, lo que podria ampliar el numero de herramientas soportadas, aunque no se verifica con metricas.

## Limitaciones y advertencias

- Sesgos: al ser un modelo pequeno entrenado principalmente en ingles, puede presentar sesgos linguisticos y culturales limitados a ese idioma.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir llamadas a funciones incorrectas o inventar argumentos, especialmente en contextos no cubiertos por el dataset de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de 270M, es probable que tenga una ventana corta (tipicamente 2048 o 4096 tokens), lo que limita conversaciones largas o instrucciones complejas.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, incluyendo restricciones para ciertos usos comerciales y la obligacion de mantener los avisos de atribucion. Es necesario revisar los Terminos de Uso de Gemma antes de desplegar en produccion.
- Cobertura limitada de acciones: el modelo solo reconoce las funciones presentes en los datasets de entrenamiento; acciones fuera de ese conjunto no seran interpretadas correctamente.
- Formato LiteRT: el modelo esta optimizado para el runtime LiteRT, por lo que su uso en otros entornos (por ejemplo, Python con transformers) puede requerir conversion y podria perder rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Combined-litert-lm
- Modelo base de Google: https://huggingface.co/google/functiongemma-270m-it
- Documentacion de FunctionGemma en Google AI: https://ai.google.dev/gemma/docs/functiongemma
- Guia de fine-tuning para Mobile Actions: https://ai.google.dev/gemma/docs/mobile-actions
- Notebook de fine-tuning en Colab: https://colab.research.google.com/github/google-gemma/gemma-cookbook/blob/main/FunctionGemma/%5BFunctionGemma%5DFinetune_FunctionGemma_270M_for_Mobile_Actions_with_Hugging_Face.ipynb
- Instrucciones de despliegue LiteRT: https://ai.google.dev/edge/litert-lm/python
