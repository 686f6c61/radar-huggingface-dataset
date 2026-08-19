# visible-cx/LFM2.5-8B-A1B-CoreAI

## Resumen

LFM2.5-8B-A1B-CoreAI es un paquete de inferencia del modelo LFM2.5-8B-A1B de Liquid AI, reempaquetado por el proyecto Visible como un bundle `.aimodel` para Apple silicon. Se trata de un modelo de texto de arquitectura híbrida sparse mixture-of-experts (MoE) con 8.300 millones de parámetros totales y aproximadamente 1.500 millones activos por token, diseñado para ejecutarse en dispositivos con memoria unificada. El bundle utiliza pesos cuantizados en int8 simétrico (`sym8`) y un kernel Metal especializado (`gather_qmm`) que acelera la decodificación al leer solo los expertos activos, alcanzando 140,4 tokens por segundo en un M4 Max según mediciones del zoo de modelos Core AI.

El modelo base de Liquid AI soporta una ventana de contexto de 128.000 tokens, razonamiento con cadena de pensamiento explícita y capacidades de tool calling y agentes. Este repositorio concreto es un espejo verificado del bundle original de `mlboydaisuke/LFM2.5-8B-A1B-CoreAI`, sin conversión ni recuantización adicional. Su relevancia radica en ofrecer una alternativa eficiente de MoE para ejecución local en Mac, con un throughput de decodificación alto gracias al kernel de recolección de expertos, aunque con limitaciones importantes: solo decodificación (sin prefill por lotes) y requisitos de memoria declarados de 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas (18 mezcladores de convolución corta y 6 capas de atención GQA); primeras 2 densas, resto MoE de 32 expertos con top-4 |
| Parametros totales | 8,3 mil millones |
| Parametros activos | ~1,5 mil millones por token |
| Longitud de contexto | 128.000 tokens (según documentación de Liquid AI) |
| Tipos de cuantizacion | `sym8` (int8 simétrico, escala por bloque de 32); existe variante int4 no publicada por degradación de calidad |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (otra, no permisiva estándar; consultar términos en el enlace del modelo base) |
| Formato de pesos | Bundle Core AI `.aimodel` (bytecode MLIR `main.mlirb`), pesos int8 simétricos con kernel `gather_qmm` |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B de Liquid AI combina bloques de convolución corta con atención de consulta agrupada (GQA) en una arquitectura híbrida de 24 capas. Las dos primeras capas son densas; a partir de la tercera, cada capa es un MoE con 32 expertos y selección top-4, lo que reduce los parámetros activos a ~1,5 mil millones por token. Esta mezcla permite un equilibrio entre eficiencia computacional y capacidad de representación, especialmente en tareas de razonamiento y agentes.

El bundle Core AI reempaqueta los pesos del checkpoint original en formato `sym8` (int8 simétrico con escala por bloque de 32) y los expone a través de un kernel Metal `gather_qmm` que lee únicamente los pesos de los expertos seleccionados, evitando la sobrelectura densa. Según el zoo de modelos, esto multiplica por ~3,6 la velocidad de decodificación (140,4 tok/s frente a 39,2 tok/s). No se dispone de detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto con razonamiento de cadena de pensamiento (chain of thought) explícito antes de la respuesta final.
- Soporte de tool calling y function calling, orientado a tareas agénticas.
- Ejecución on-device en Apple silicon con alta velocidad de decodificación gracias al kernel `gather_qmm`.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Modelo solo de texto (sin visión ni audio).
- En este bundle concreto, la inferencia se limita a decodificación (decode-only); el prefill se realiza token a token, sin función de prefill por lotes.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede mantener diálogos de contexto largo (128K) con baja latencia de decodificación (140 tok/s en M4 Max), ideal para aplicaciones de escritorio que requieran privacidad.
- Agentes autónomos con tool calling: su soporte nativo de function calling permite integrarlo en pipelines que invoquen APIs, ejecuten comandos o consulten bases de datos, con razonamiento multi-paso.
- Generación y refactorización de código en entornos de desarrollo: aunque no se reportan benchmarks de HumanEval, su capacidad de razonamiento y contexto amplio lo hace apto para completar código, revisar PRs o generar documentación.
- Análisis de documentos extensos: con 128K de contexto, puede resumir informes, contratos o artículos largos sin truncamiento, procesándolos en una sola pasada.
- Automatización de atención al cliente: gestión de incidencias multi-turno con memoria de conversación completa, ejecutándose en hardware local para cumplir requisitos de soberanía de datos.
- Prototipado de sistemas RAG: su velocidad de decodificación y capacidad de tool calling permiten construir pipelines de recuperación aumentada que respondan con citas y referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados provienen del zoo de modelos Core AI, medidos en un M4 Max:

| Metrica | Valor |
|---|---|
| Velocidad de decodificación (gather) | 140,4 tok/s |
| Velocidad de decodificación (sobrelectura densa) | 39,2 tok/s |
| Calidad frente a referencia fp16 | +1 flip / 41 (límite fp16) |

Estas mediciones son del bundle original, no de este repositorio espejo, que está pendiente de cualificación. No hay datos de latencia de prefill ni de throughput en otros hardware.

## Requisitos de hardware

- Apple silicon Mac obligatorio (no compatible con GPUs NVIDIA o AMD); el bundle no cabe en un iPhone (9,4 GB).
- Memoria unificada: se declara un tier de 32 GB. Un informe de campo en un Mac de 16 GB reportó congelaciones con ~9,4 GB de memoria sucia y picos de 12-13 GB; la recomendación conservadora es 32 GB o más.
- GPU recomendada: M4 Max (donde se midieron los 140,4 tok/s). No se han medido otros chips.
- Despliegue exclusivo con el runtime Core AI; no es compatible con vLLM, llama.cpp, Ollama o TGI.
- La inferencia es decode-only: el prefill se realiza token a token, lo que puede aumentar la latencia en prompts largos.
- Se requiere la variable de entorno `COREAI_CHUNK_THRESHOLD = "1"` para el prefill más conservador en memoria.

## Comparativa con modelos similares

No hay datos comparativos publicados en la información disponible. El modelo base de Liquid AI se posiciona frente a otros MoE on-device como Gemma 4 12B (mencionado en la model card como referencia de cualificación pendiente) y gpt-oss-20b (usado en mediciones de memoria del zoo). Sin embargo, no se proporcionan cifras de rendimiento o calidad para estos modelos. La comparativa queda pendiente de la cualificación del bundle en hardware Visible.

## Limitaciones y advertencias

- Bundle decode-only: no hay función de prefill; los prompts se procesan token a token, lo que puede degradar la latencia en entradas largas.
- Solo Apple silicon: no es portable a otras plataformas ni a GPUs convencionales.
- Requisito de memoria elevado: el tier declarado de 32 GB no está confirmado con mediciones propias; un Mac de 16 GB se congeló en una prueba. Se recomienda verificar con `vmmap` y `/usr/bin/time -l` antes de usar en producción.
- Licencia lfm1.0: no es una licencia permisiva estándar; es necesario revisar los términos del modelo base para uso comercial.
- Riesgo de alucinación y sesgos: no se han evaluado en este bundle; no hay datos de evaluación de seguridad o sesgos.
- Sin benchmarks estándar: no se puede comparar su rendimiento académico con otros modelos.
- Estado de cualificación: este repositorio es un espejo sin verificación funcional propia; la única medición de rendimiento proviene del zoo upstream.

## Enlaces

- Repositorio HuggingFace de este bundle: https://huggingface.co/visible-cx/LFM2.5-8B-A1B-CoreAI
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Bundle original upstream: https://huggingface.co/mlboydaisuke/LFM2.5-8B-A1B-CoreAI
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Análisis de hardware y VRAM: https://www.madebyagents.com/models/lfm2-5-8b-a1b
