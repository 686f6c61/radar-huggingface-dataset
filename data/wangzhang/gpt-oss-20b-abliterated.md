# wangzhang/gpt-oss-20b-abliterated

## Resumen

`gpt-oss-20b-abliterated` es una variante del modelo open-source `openai/gpt-oss-20b` a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante técnicas de edición directa de pesos. El autor, wangzhang, utiliza la herramienta `abliterix` para aplicar tres correcciones específicas de la arquitectura MoE de gpt-oss: des-cuantización de pesos MXFP4 a BF16, proyección ortogonal sobre los pesos de los expertos (Expert-Granular Abliteration, EGA) y supresión de las filas del router asociadas a los "expertos de seguridad". El resultado es un modelo que responde a instrucciones dañinas sin rechazarlas, manteniendo una divergencia KL mínima respecto al base en entradas benignas.

El modelo conserva la arquitectura original de gpt-oss-20b: 24 capas, 32 expertos enrutados por capa con top-4, dimensiones ocultas e intermedias de 2880, y una ventana de contexto de 128K tokens. Está disponible bajo licencia Apache-2.0 y en formato safetensors, con una versión GGUF separada. Su relevancia actual radica en ser una herramienta de investigación para estudiar los mecanismos de seguridad en modelos MoE, así como para evaluaciones de red-teaming, aunque su uso para generar contenido dañino está explícitamente desaconsejado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, 24 capas, 32 expertos por capa, top-4 |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible (no se especifica en la informacion) |
| Longitud de contexto | 128.000 tokens (segun llm-explorer.com) |
| Tipos de cuantizacion | no disponible en la informacion; existe repo GGUF separado |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 tras de-cuantizacion; el base usa MXFP4) |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-20b` es un transformer MoE con 24 capas, 32 expertos enrutados por capa y seleccion top-4. Las dimensiones oculta e intermedia son ambas 2880, lo que complica la deteccion automatica de ejes en tecnicas de edicion de pesos. Los pesos nativos estan empaquetados en formato MXFP4 (microscaling floating point 4 bits) dentro de un modulo `Mxfp4GptOssExperts`, cuyo `down_proj` es un tensor Triton empaquetado que no puede editarse in-place. Para la abliteracion, `abliterix` fuerza la de-cuantizacion a BF16 y accede al tensor fusionado de expertos.

El proceso de edicion combina tres tecnicas: (1) proyeccion ortogonal directa sobre los pesos de atencion (`q,k,v,o_proj`) y sobre los `down_proj` de todos los 32 expertos × 24 capas (EGA), (2) supresion de las filas del router correspondientes a los "expertos de seguridad" (aquellos cuya activacion es desproporcionadamente mayor en prompts dañinos que en benignos), y (3) optimizacion de hiperparametros mediante Optuna TPE con 100 ensayos, usando como objetivos la divergencia KL y la tasa de rechazo evaluada por un LLM juez. El vector de direccion de rechazo se calcula por capa como la media de los residuales (target − benigno) sobre 400 prompts benignos y 400 dañinos. No se ha publicado informacion sobre el entrenamiento original del modelo base (datos, tokens, RLHF), ya que esta variante solo modifica pesos ya entrenados.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con estilo y formato similares al modelo base (tablas Markdown, pasos numerados).
- Razonamiento tecnico y respuestas a preguntas de conocimiento general, heredadas del base.
- Capacidad de seguir instrucciones complejas y de mantener coherencia multi-turno gracias a la ventana de 128K tokens.
- Respuesta directa a prompts dañinos o ilegales (lockpicking, phishing, sintesis de metanfetamina, hackeo WiFi, fabricacion de bombas, etc.) sin rechazo ni degradacion a gibberish, segun las evaluaciones del autor.
- No se ha confirmado soporte explicito de tool calling, function calling o modo agente en esta variante; la informacion disponible no lo menciona.
- No se indica capacidad multimodal (vision, audio) en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA: analizar como los modelos MoE concentran comportamientos de seguridad en expertos especificos y como la edicion de pesos altera ese equilibrio. El modelo permite estudiar la localizacion de la "direccion de rechazo" en el espacio de activaciones.
- Evaluacion de red-teaming: probar la robustez de sistemas de moderacion y filtros de contenido ante respuestas que no pasan por el rechazo clasico, usando este modelo como generador de contenido adversario controlado.
- Estudio de tecnicas de interpretabilidad: comparar las activaciones de este modelo con las del base para identificar que capas y expertos codifican politicas de seguridad, gracias a la EGA aplicada por capa.
- Desarrollo de tecnicas de edicion de modelos: validar metodologias de abliteracion en arquitecturas MoE con pesos cuantizados, ya que este modelo es un caso de estudio real de los problemas de compatibilidad (MXFP4, ejes transpuestos, expertos fusionados).
- Generacion de contenido creativo sin restricciones tematicas: aunque no es el uso recomendado, el modelo puede producir narrativas o guiones que aborden temas tabu sin auto-censura, util en contextos artisticos o literarios con supervisión humana.
- Benchmarking de alineacion: medir el impacto de la supresion de rechazo en metricas de utilidad (KL, longitud de respuesta) para calibrar futuros metodos de desalineacion controlada.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K). En su lugar, el autor reporta metricas especificas de la abliteracion:

| Metrica | Base `gpt-oss-20b` | Este modelo |
|---|---|---|
| Rechazos en 100 prompts dañinos (juez LLM) | 97 / 100 | 6 / 100 |
| Divergencia KL vs base (siguiente token, benigno) | — | 0,0098 |
| Desviacion de longitud de respuesta vs base (benigno) | — | 0,02 σ |
| Cumplimiento cualitativo en 15 jailbreaks clasicos (EN+ZH) | 0 / 15 | 15 / 15 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~41,6 GB en precision BF16 (segun llm-explorer.com). Con cuantizacion GGUF de 4 bits, podria reducirse a ~12-15 GB, aunque no se especifican tamaños exactos.
- GPU recomendadas: para BF16 completo, una NVIDIA RTX 4090 (24 GB) no es suficiente; se necesitan GPUs con 48 GB o mas (A6000, A100 40/80 GB, H100) o multiples GPUs. Con cuantizacion 4-bit, una RTX 3090/4090 (24 GB) podria ser viable.
- El proceso de abliteracion se realizo en una NVIDIA RTX PRO 6000 Blackwell (96 GB, sm_120) con driver 580 / CUDA 12.9, batch=8, tardando ~5 h 20 m.
- Opciones de despliegue: compatible con transformers (libreria principal), vLLM, TGI y llama.cpp (via repo GGUF). Tambien se puede usar con Ollama si se convierte el GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo de desalineacion | Rechazo en prompts dañinos |
|---|---|---|---|---|---|
| `openai/gpt-oss-20b` (base) | 20,9 B | 128K | Apache-2.0 | Ninguno (alineado) | 97/100 |
| `wangzhang/gpt-oss-20b-abliterated` | 20,9 B | 128K | Apache-2.0 | Abliteracion directa + EGA + supresion de router | 6/100 |
| Otros modelos abliterated (p.ej. `mlabonne/...` para LLaMA) | variable | variable | variable | Abliteracion clasica (proyeccion sobre capas MLP) | no disponible |

No se dispone de datos de rendimiento en tareas estandar para comparar con otros modelos de la misma categoria. La comparativa se limita a la diferencia con el modelo base.

## Limitaciones y advertencias

- El modelo esta disenado para eliminar rechazos, lo que implica un riesgo elevado de generar contenido ilegal, peligroso o eticamente cuestionable. Su uso para producir dicho contenido esta explicitamente desaconsejado por el autor.
- No se ha evaluado su rendimiento en tareas de razonamiento, codigo o matematicas; la abliteracion podria degradar capacidades no relacionadas con la seguridad, aunque la KL baja sugiere un impacto minimo en distribuciones benignas.
- La evaluacion de rechazos se realizo con un juez LLM (gemini-3.1-flash-lite-preview) y un filtro heuristico; podria haber falsos positivos o negativos en otros conjuntos de prompts.
- El modelo solo soporta ingles y chino; no se garantiza calidad en otros idiomas.
- Aunque la licencia es Apache-2.0, el autor recuerda que se aplica la politica de uso de OpenAI para gpt-oss; el usuario es responsable del cumplimiento legal.
- La ventana de contexto de 128K no se ha verificado de forma independiente en esta variante; podria haber diferencias con el base.
- No se proporcionan garantias de estabilidad en produccion; es un modelo de investigacion, no un producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/gpt-oss-20b-abliterated
- Repo GGUF: https://huggingface.co/wangzhang/gpt-oss-20b-abliterated-GGUF
- Herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Documentacion de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Ficha en llm-explorer: https://llm-explorer.com/model/wangzhang%2Fgpt-oss-20b-abliterated,17uz9XZ8FrGEetJ9QCMHL9
