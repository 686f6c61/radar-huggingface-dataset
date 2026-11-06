# tanishq5/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.730 millones de parametros desarrollado por Liquid AI, publicado originalmente como `LiquidAI/LFM3-1.7B` y redistribuido en este repositorio por el usuario `tanishq5`. Se trata de un checkpoint post-entrenado, solo texto, orientado a agentes locales y aplicaciones especializadas sobre dispositivos de borde. Su propuesta central es ofrecer una ventana de contexto de 256.000 tokens en un modelo que, cuantizado a 4 bits, ocupa aproximadamente 1 GB de memoria, lo que lo hace viable en telefonos moviles y portatiles convencionales.

La arquitectura es un transformer hibrido de tres componentes (denominado tri-hybrid por el autor): 24 capas compuestas por 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta mezcla reduce el coste computacional del contexto largo frente a un transformer denso clasico, manteniendo capacidad de recuperacion global de informacion. El modelo se distribuye con licencia LFM 1.0 (marcada como `other` en Hugging Face) y soporta 16 idiomas, incluido el castellano.

Es relevante ahora porque combina dos tendencias del ecosistema open source: modelos pequenos optimizados para inferencia en dispositivo y entrenamiento especifico para entornos agente (Hermes Agent, Pi, OpenClaw). Frente a alternativas densas de tamano similar, su interes esta en el contexto de 256K y en la facilidad de especializacion mediante fine-tuning en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tri-componente: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens (entrada + salida) |
| Tipos de cuantizacion | 4 bits mencionado por el autor; no se detallan otros formatos en la informacion disponible |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, castellano, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | LFM 1.0 (`lfm1.0`, etiquetada como `other` en Hugging Face) |
| Formato de pesos | Safetensors (repo de 3,5 GB); requiere `trust_remote_code` por `custom_code` |
| Vocabulario | 128.000 tokens |
| Tipo de checkpoint | Post-entrenado, solo texto |
| Modelo base | `LiquidAI/LFM3-1.7B-Base` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que alterna tres tipos de capa en lugar de apilar atencion completa en todas ellas. Las 13 capas de convolucion corta con compuerta gestionan dependencias locales con coste lineal respecto a la longitud de secuencia; las 5 capas de atencion de ventana deslizante cubren rangos intermedios; y las 6 capas de atencion global permiten el acceso a informacion de todo el contexto. Esta distribucion (mayoria de capas convolucionales, minoria de atencion global) es la que hace economicamente viable una ventana de 256K tokens en un modelo de 1,73B de parametros.

El checkpoint es la version post-entrenada del base `LiquidAI/LFM3-1.7B-Base`. Segun la model card, el post-entrenamiento esta orientado a entornos agente concretos (Hermes Agent, Pi y OpenClaw) y el modelo esta disenado para especializarse mediante fine-tuning rapido en una sola GPU. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El vocabulario de 128.000 tokens es amplio para el tamano del modelo, lo que favorece la compresion multilingue.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256.000 tokens.
- Entrenamiento orientado a agentes: soporte de flujos con herramientas y razonamiento de varios pasos en entornos como Hermes Agent, Pi y OpenClaw.
- Capacidad multilingue en 16 idiomas, con cobertura de familias linguisticas diversas (semita, sino-tibetana, romanica, germanica, japonesa, coreana, austroasiatica, austronesia, indoaria, eslava).
- Especializacion por fine-tuning: el autor indica que se puede adaptar a dominios, formatos y herramientas concretas con entrenamiento en una sola GPU.
- Despliegue en dispositivo: a 4 bits ocupa aproximadamente 1 GB, lo que permite ejecucion local en moviles y portatiles.
- No se menciona soporte explicito de vision, audio ni modo de razonamiento extendido (thinking) en la informacion disponible; la familia LFM3 incluye variantes de vision, audio, omni y decision, pero este checkpoint concreto es solo texto.

## Casos de uso

- Agentes locales en dispositivo: el modelo puede ejecutarse en un telefono o portatil con ~1 GB a 4 bits y gestionar bucles de agente con llamadas a herramientas, adecuado para asistentes personales que no envian datos a la nube.
- Atencion al cliente automatizada: los 256K tokens de contexto permiten mantener historiales de conversacion largos o inyectar documentacion de producto extensa sin truncar, en un modelo lo bastante pequeno para desplegarse en infraestructura modesta.
- Procesamiento de documentos largos: resumen, extraccion de entidades y respuesta sobre contratos, informes o expedientes que superen decenas de miles de tokens, aprovechando la ventana extendida sin necesidad de tecnicas de recuperacion.
- Especializacion vertical por fine-tuning: adaptacion a formatos propietarios, jerga de sector o esquemas de herramientas concretos mediante entrenamiento en una sola GPU, segun indica el autor.
- Automatizacion de flujos con herramientas en entornos de escritorio: integracion en harnesses tipo OpenClaw o Pi para tareas de manipulacion de ficheros, consultas a APIs y ejecucion de comandos supervisada.
- Prototipado y evaluacion rapida: al caber en GPU de consumo y en CPU con cuantizacion, sirve para validar pipelines de agentes antes de migrar a modelos mayores.
- Traduccion y generacion multilingue: cobertura de 16 idiomas, util para preprocesado o generacion en aplicaciones con usuarios de varias regiones, con la salvedad de que el castellano no es el idioma principal de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos, y la etiqueta `eval-results` del repositorio no viene acompanada de datos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits segun el autor; en precision completa (BF16/FP16) los 1,73B de parametros requieren alrededor de 3,5 GB solo para pesos, mas memoria para el KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizacion; A100, H100 o L40S para despliegues de mayor concurrencia y contexto completo de 256K.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida en cuantizacion baja; tambien en telefonos moviles segun el autor.
- Opciones de despliegue: la libreria indicada es `transformers` con `trust_remote_code` obligatorio por el codigo personalizado. No se confirma en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI; la arquitectura hibrida con convoluciones y atencion de ventana deslizante suele requerir kernels especificos, por lo que la compatibilidad con esos motores debe verificarse antes de usarla en produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B (este) | 1,73B | 256K | LFM 1.0 | Hibrido convolucion/atencion, orientado a agentes en dispositivo |
| Qwen3-1.7B | 1,7B | 32K (extensible) | Apache 2.0 | Transformer denso, ecosistema amplio de despliegue |
| Llama 3.2 1B | 1,24B | 128K | Llama 3.2 Community | Transformer denso, fuerte soporte en llama.cpp y Ollama |
| Gemma 3 1B | 1B | 32K | Gemma Terms | Transformer denso, multilingue |

La comparativa se limita a datos publicos de cada familia; no se dispone de resultados de benchmarks del LFM3-1.7B en la informacion proporcionada para contrastar rendimiento real frente a estas alternativas. La ventaja diferencial del LFM3-1.7B es la combinacion de contexto de 256K con huella de ~1 GB a 4 bits; la desventaja es una licencia propia mas restrictiva que Apache 2.0 y un soporte de motores de inferencia menos consolidado.

## Limitaciones y advertencias

- Licencia LFM 1.0: no es una licencia open source estandar; revisar los terminos exactos antes de uso comercial, ya que puede incluir restricciones de escala o de competicion.
- Requiere `trust_remote_code`: el repositorio incluye codigo personalizado, lo que implica ejecutar logica del autor al cargar el modelo; auditar antes de desplegar.
- Riesgo de alucinacion: como todo modelo de 1,7B, la fidelidad factual es limitada; no es adecuado para tareas que exijan precision verificada sin comprobacion externa.
- Idiomas: aunque se listan 16, el ingles es el idioma principal; el rendimiento en castellano, hindi o tailandes puede ser desigual y no hay benchmarks publicados que lo cuantifiquen.
- Contexto largo: los 256K tokens son una capacidad arquitectonica; la calidad de recuperacion en posiciones lejanas no esta validada con datos publicos en la informacion disponible.
- Repositorio secundario: este checkpoint es una redistribucion por `tanishq5` con 0 descargas y 0 likes; para produccion conviene referenciar el repositorio oficial `LiquidAI/LFM3-1.7B` y verificar que los pesos coinciden.
- Compatibilidad de despliegue: la arquitectura hibrida puede no estar soportada por todos los motores de inferencia; validar vLLM, llama.cpp u Ollama antes de planificar produccion.
- Sin datos de sesgo: no se ha publicado informacion sobre evaluaciones de sesgo o seguridad en el material disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tanishq5/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo oficial post-entrenado: https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
