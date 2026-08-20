# zaakirio/Ornith-1.5-9B-Uncensored

## Resumen

Ornith-1.5-9B-Uncensored es una versión "decensored" (abliterated) del modelo base ornith-ai/Ornith-1.5-9B, publicada por el usuario zaakirio. El proceso de ablación elimina las direcciones de rechazo del modelo original mediante la herramienta Heretic, que realiza una búsqueda TPE sobre las intensidades de ablación por capa, co-optimizando la tasa de rechazo frente a la divergencia KL con el modelo original. No implica fine-tuning ni reentrenamiento, por lo que las capacidades del modelo base se conservan salvo un desplazamiento de distribución medido.

El modelo base es un híbrido Qwen3.5 con 32 capas que intercalan bloques de atención lineal gated DeltaNet con atención completa cada cuarta capa, e incluye una torre de visión (multimodal). Tiene aproximadamente 9.400 millones de parámetros y una ventana de contexto de 262.000 tokens. Requiere una versión reciente de transformers (>= 5.12) y su configuración desactiva la caché de uso, lo que ralentiza la generación en comparación con modelos densos típicos.

La relevancia de este modelo radica en su capacidad para responder a solicitudes que el modelo original rechazaría, lo que lo hace útil para investigación en seguridad de IA, análisis de comportamientos sin restricciones y generación de contenido en dominios sensibles, aunque con menos salvaguardas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 32 capas con bloques gated DeltaNet (atención lineal) intercalados con atención completa cada 4ª capa, más torre de visión |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

Ornith-1.5-9B-Uncensored no ha sido entrenado, sino ablacionado. El proceso utiliza Heretic, que ejecuta una búsqueda TPE (Tree-structured Parzen Estimator) sobre las intensidades de ablación por capa para las proyecciones de salida de atención y de MLP, co-optimizando la tasa de rechazo frente a la divergencia KL con el modelo original. El resultado es una reducción de rechazos marcados por palabras clave de 85/100 a 55/100 en el conjunto de prueba de `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0017 en prompts inofensivos, lo que indica que el comportamiento en consultas ordinarias apenas cambia.

La arquitectura subyacente es la del modelo base: un híbrido Qwen3.5 con 32 capas que combinan bloques de atención lineal gated DeltaNet con atención completa cada cuarta capa, más una torre de visión para entrada multimodal. El modelo soporta 262.000 tokens de contexto y requiere transformers >= 5.12 para reconocer la arquitectura `qwen3_5`. La configuración del modelo establece `use_cache: false`, lo que afecta al rendimiento de generación.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base.
- Entrada multimodal (visión): el modelo incluye una torre de visión, por lo que puede procesar imágenes junto con texto.
- Contexto largo de 262.000 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Menor tasa de rechazo: responde a solicitudes que el modelo original declinaría, incluyendo temas sensibles o controvertidos.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta un modo de razonamiento especial (thinking mode) ni capacidades de audio.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo responden los modelos sin restricciones de rechazo, analizando sesgos, alucinaciones o comportamientos ante prompts maliciosos.
- Generación de contenido creativo en dominios sensibles: producir textos sobre temas tabú o controvertidos para ficción, guiones o análisis académico, donde el modelo original podría negarse.
- Análisis de imágenes con respuestas sin filtros: aprovechar la multimodalidad para describir o interpretar imágenes en contextos donde se requiere una respuesta directa sin evasivas.
- Desarrollo de sistemas de diálogo con menos restricciones: crear asistentes que no rechacen preguntas sobre temas delicados, siempre que el despliegue cumpla con las normativas aplicables.
- Evaluación de técnicas de ablación: comparar el comportamiento de este modelo con el base para medir el impacto de la eliminación de direcciones de rechazo.
- Pruebas de robustez: verificar si el modelo es más propenso a aceptar premisas incorrectas tras la ablación, lo que es útil para estudiar la complacencia en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos reportados son los resultados de la ablación:

| Metrica | Valor |
|---|---|
| Rechazos marcados por palabras clave (100 prompts dañinos) | 85/100 -> 55/100 |
| Divergencia KL en prompts inofensivos | 0,0017 |
| Ensayos de búsqueda TPE | 100 (exportado el ensayo 79) |
| Precisión de cálculo | bf16 en NVIDIA A40 |

Estos datos no son comparables con benchmarks de rendimiento general, sino que miden el efecto de la ablación sobre el comportamiento de rechazo.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para inferencia.
- El tamaño del repositorio es de 18,8 GB, lo que sugiere que los pesos en bf16 ocupan aproximadamente esa cantidad. Para inferencia en bf16 se estima un mínimo de 20 GB de VRAM (p. ej., una NVIDIA A40, RTX 4090 o superior).
- Con cuantización a 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp o GPTQ), la huella de memoria podría reducirse a unos 5-6 GB, permitiendo su uso en GPUs de consumo como RTX 3060 o superiores.
- El proceso de ablación se realizó en una NVIDIA A40 con bf16, lo que da una referencia del hardware necesario para reproducir el procedimiento.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o directamente con la API de transformers. También podría convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- La configuración `use_cache: false` reduce el rendimiento de generación; se recomienda evaluar la latencia en el hardware objetivo antes de un despliegue en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ornith-ai/Ornith-1.5-9B (base) | 9,4 B | 262k | MIT | Modelo original con rechazos intactos |
| zaakirio/Ornith-1.5-9B-Uncensored | 9,4 B | 262k | MIT | Versión abliterated, menos rechazos, misma arquitectura |
| Otros modelos abliterated (p. ej., Dolphin, WizardLM-Uncensored) | Variable | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría. La comparación principal es con el modelo base, del que se diferencia únicamente en la reducción de rechazos y una ligera divergencia KL.

## Limitaciones y advertencias

- El modelo tiene menos salvaguardas de seguridad: es más probable que responda a solicitudes dañinas, ilegales o poco éticas. El usuario es responsable del uso que haga de él.
- La ablación puede aumentar la complacencia con premisas incorrectas, lo que puede llevar a respuestas factualmente erróneas. Se recomienda verificar la salida en contextos críticos.
- La reducción de rechazos es modesta en comparación con lo que Heretic suele lograr en modelos densos; la arquitectura híbrida parece resistente a la ablación, por lo que algunos rechazos persisten.
- La métrica de rechazo por palabras clave puede sobreestimar la tasa real, ya que marcadores como "illegal" o "I can't" también aparecen en respuestas conformes que discuten temas sensibles.
- Requiere transformers >= 5.12; versiones anteriores fallan con `unknown architecture 'qwen3_5'`.
- La configuración `use_cache: false` hace que la generación sea considerablemente más lenta que en modelos densos típicos.
- No se documentan idiomas soportados ni cuantizaciones oficiales; el repositorio solo contiene pesos en bf16.
- La licencia MIT permite uso comercial, pero el despliegue de un modelo sin restricciones puede incurrir en responsabilidades legales o éticas según el contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zaakirio/Ornith-1.5-9B-Uncensored
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
