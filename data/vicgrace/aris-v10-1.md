# Vicgrace/ARIS-V10.1

## Resumen

ARIS V10.1 es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario Vicgrace, orientado a funcionar como asesor agronomico offline para pequenos agricultores de Nigeria. Se distribuye como un unico archivo GGUF cuantizado en Q4_K_M, pensado explicitamente para ejecutarse en hardware modesto: 8 GB de RAM, 4 vCPU y sin conexion a internet. El problema que aborda es la falta de asistentes en lengua local accesibles en zonas rurales con conectividad limitada.

Tecnicamente es un transformer denso, decoder-only, de 1.543.714.304 parametros (aproximadamente 1,54 mil millones), heredado de la arquitectura Qwen2.5. El ajuste se realizo con QLoRA (r=64, alpha=128) sobre 1.911 registros agronomicos nigerianos propios, con perdida calculada solo sobre la respuesta y 2 epocas de entrenamiento. El resultado es un adaptador fusionado y cuantizado, no un modelo entrenado desde cero.

Su relevancia actual es acotada pero ilustrativa: demuestra el flujo completo de adaptacion de un modelo pequeno multilingue a un dominio vertical y a un idioma de bajos recursos como el pidgin nigeriano (codigo ISO `pcm`), con un coste de entrenamiento minimo y despliegue en CPU. No obstante, el repositorio no publica resultados de evaluacion, no tiene descargas ni interacciones registradas, y su licencia CC-BY-4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only, derivado de Qwen2.5 (no confirmado en la model card, inferido del modelo base) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens segun las especificaciones del modelo base Qwen2.5-1.5B-Instruct; no confirmado en la model card de ARIS V10.1 |
| Tipos de cuantizacion | Q4_K_M (GGUF). No se distribuyen otras cuantizaciones |
| Idiomas soportados | Ingles (en) y pidgin nigeriano (pcm) segun los metadatos; el pidgin es el idioma objetivo del ajuste |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`ARIS-V10.1-1.5B-Q4_K_M.gguf`); el ajuste original fue un adaptador QLoRA |
| Tamano del repositorio | 1,0 GB |
| Hardware objetivo declarado | 8 GB de RAM, 4 vCPU, funcionamiento offline |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct (revision b2e27ed8774d78eb2ee474cfe99d2d3b5fae11e5) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de tokens atados a la proyeccion de salida y attention con sesgo QKV. Se trata de un modelo denso, sin componentes de mezcla de expertos ni mecanismos de estado recurrente. La model card de ARIS V10.1 no detalla modificaciones estructurales, por lo que se asume que la topologia es identica a la del modelo base y que el unico cambio es el ajuste de pesos.

El entrenamiento consistio en un ajuste QLoRA con rango 64 y alpha 128 sobre 1.911 registros agronomicos nigerianos generados internamente, con perdida aplicada unicamente a los tokens de respuesta (response-only loss) durante 2 epocas. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni el uso de RLHF, DPO u otra fase de alineacion posterior al ajuste supervisado. El autor indica que la procedencia completa (dataset, entrenamiento y evaluacion) se incluye en un paquete de envio bajo el directorio `provenance/`, pero ese material no esta disponible en la informacion consultada. Tampoco se declara ninguna innovacion tecnica especifica mas alla de la cuantizacion Q4_K_M para llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles y pidgin nigeriano, con registro adaptado al dominio agronomico.
- Asesoramiento agronomico: consultas sobre cultivos, practicas de cultivo, plagas y manejo agricola en el contexto nigeriano.
- Razonamiento basico y respuesta a preguntas de dominio limitado, heredado de las capacidades del Qwen2.5-1.5B-Instruct.
- Ejecucion completamente offline: no requiere conectividad de red en tiempo de inferencia.
- Funcionamiento en CPU sin GPU, gracias a la cuantizacion Q4_K_M y al tamano reducido del modelo.
- No se documenta soporte de tool calling ni function calling en la model card. El modelo base Qwen2.5-Instruct si incorpora capacidades de function calling, pero no hay confirmacion de que el ajuste las preserve.
- No se documenta modo de razonamiento explicito (thinking mode), soporte de vision, audio ni capacidades multimodales.
- No se documenta soporte de agentes ni razonamiento multi-paso; el modelo esta etiquetado como conversacional.
- Capacidades multilingues fuera de `en` y `pcm`: no disponibles.

## Casos de uso

- Consulta agronomica offline en campo: un agricultor sin cobertura movil puede ejecutar el modelo en un portatil o mini-PC modesto y plantear dudas sobre preparacion del suelo, epoca de siembra o rotacion de cultivos obteniendo respuestas en pidgin nigeriano.
- Aplicacion movil o de escritorio embebida: con 1,0 GB de pesos Q4_K_M y un objetivo declarado de 8 GB de RAM, el modelo se puede integrar en un cliente local tipo llama.cpp sin depender de APIs externas.
- Extension de servicios de divulgacion agricola: ONGs y cooperativas pueden desplegar terminales o puntos de acceso comunitarios donde el modelo responda preguntas frecuentes en ausencia de un agronomo presencial.
- Traduccion y adaptacion de material tecnico al pidgin: dado su ajuste en `pcm`, puede emplearse para reformular recomendaciones tecnicas en un registro comprensible para el publico objetivo.
- Prototipado de asistentes de dominio restringido: sirve como banco de pruebas de bajo coste para validar si un modelo de 1,5 B ajustado con QLoRA resulta suficiente antes de escalar a modelos mayores.
- Educacion y formacion agricola: generacion de explicaciones paso a paso y material de apoyo para escuelas de campo, con la ventaja de no requerir conexion.
- Investigacion sobre ajuste eficiente: caso de estudio reproducible para analizar el efecto de QLoRA con r=64 sobre un dataset de menos de 2.000 ejemplos en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras) ni metricas de dominio agronomico, y el autor remite a un paquete de procedencia externo que no se ha podido consultar. Tampoco hay datos de latencia o throughput declarados.

## Requisitos de hardware

- VRAM/RAM para inferencia: el archivo Q4_K_M ocupa aproximadamente 1,0 GB, por lo que la huella en memoria se situa en el entorno de 1,5-2,5 GB contando contexto y overhead del runtime. Los pesos en fp16 del modelo base requeririan alrededor de 3,1 GB.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas es suficiente para el archivo cuantizado. Modelos como RTX 3050, RTX 4060, GTX 1660, A100 o H100 funcionan, aunque estas dos ultimas estan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en iGPU con memoria unificada suficiente.
- Ejecucion en CPU: viable. El autor declara como objetivo 8 GB de RAM y 4 vCPU, un perfil propio de mini-PC, portatil de gama baja o placa tipo Raspberry Pi 5 con 8 GB.
- Opciones de despliegue: llama.cpp es el runtime de referencia indicado por el autor. Ollama y otros frontends compatibles con GGUF pueden cargar el archivo. vLLM y TGI no son aplicables directamente al archivo GGUF, aunque podrian servir los pesos base en safetensors si se fusionaran aparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ARIS V10.1 | 1,54 B | 32.768 tokens (heredado del base) | CC-BY-4.0 | GGUF Q4_K_M en HuggingFace, 0 descargas | Ajuste de dominio agronomico en en/pcm, sin evaluacion publicada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors y multiples cuantizaciones, ampliamente distribuido | Modelo base, licencia mas permisiva y ecosistema de cuantizaciones mucho mayor |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF, ampliamente distribuido | Alternativa de tamano similar, contexto mayor, pero sin ajuste para pidgin nigeriano |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors y GGUF, ampliamente distribuido | Mas parametros y contexto mas corto; requiere revision de la licencia para uso comercial |

La comparacion debe interpretarse con cautela: no existen numeros de benchmark de ARIS V10.1 que permitan situarlo objetivamente frente a estas alternativas. La ventaja diferencial declarada es la especializacion en agronomia nigeriana y en pidgin, no el rendimiento general.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluacion humana, ni metricas de dominio que respalden la calidad de las respuestas.
- Riesgo elevado de alucinacion: un ajuste sobre 1.911 registros y 2 epocas puede producir recomendaciones agronomicas incorrectas (dosis de fertilizante, plaguicidas, calendarios de siembra). En un dominio donde un error tiene consecuencias sobre cosechas o salud, esto exige supervision humana.
- Sobreajuste probable al dataset de entrenamiento: con menos de 2.000 ejemplos y 2 epocas, el modelo puede reproducir patrones del corpus y degradar su capacidad generalista (olvido catastrofico de las capacidades originales de Qwen2.5).
- Sesgo geografico y de dominio: el ajuste esta limitado al contexto nigeriano. Las recomendaciones pueden no ser validas para otras latitudes, suelos o marcos regulatorios.
- Cobertura idiomatica restringida: solo `en` y `pcm`. No se documenta soporte de hausa, yoruba, igbo ni de ninguna otra lengua del entorno.
- Modelo de 1,5 B: capacidad limitada para razonamiento complejo, matematicas, codigo y cadenas de razonamiento largas en comparacion con modelos de mayor tamano.
- Sin evidencia de soporte de tool calling o function calling tras el ajuste; conviene verificarlo antes de integrarlo en pipelines que dependan de llamadas a herramientas.
- Trazabilidad incompleta: el autor remite a un directorio `provenance/` que no esta disponible en el repositorio consultado, por lo que no se puede auditar la composicion del dataset ni la metodologia de evaluacion.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribucion. Al derivar de Qwen2.5 (Apache 2.0), conviene verificar la compatibilidad de la licencia elegida con los terminos del modelo base si se redistribuye.
- Adopcion nula: 0 descargas y 0 interacciones en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Metadatos con fecha de creacion futura (2026-09-19) respecto al momento de la consulta, lo que dificulta datar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vicgrace/ARIS-V10.1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: no disponible en la informacion proporcionada
- Paper o documentacion tecnica de ARIS V10.1: no disponible
- Repositorio de codigo o demo: no disponible
- Paquete de procedencia (`provenance/`): referenciado en la model card, no accesible en la informacion consultada

Nota: los resultados de la busqueda web proporcionados no contienen enlaces relevantes al modelo; corresponden a consultas no relacionadas sobre vivienda y salud. No se han incluido por no ser pertinentes.
