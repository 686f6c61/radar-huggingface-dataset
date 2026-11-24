# SynhalaAI/Tharushi-Gemma4-E2B-CPT

## Resumen

Tharushi-Gemma4-E2B-CPT es un ajuste fino (fine-tuning) del modelo multimodal Gemma 4 E2B en su variante instruct, publicado por SynhalaAI. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`) y se ha entrenado mediante continuacion de preentrenamiento (CPT, *continued pre-training*) para reforzar el conocimiento en ingles y singales (si). El pipeline declarado es `image-text-to-text`, lo que confirma que conserva la capacidad de procesar imagenes y texto de forma conjunta.

El modelo cuenta con 5.123.178.051 parametros segun los pesos en safetensors, lo que lo situa en la gama de modelos compactos aptos para inferencia en hardware de consumo moderado. Su interes principal radica en ser una adaptacion de un modelo Gemma 4 de ultima generacion orientada a un idioma de bajos recursos como el singales, un caso poco cubierto por los modelos generalistas. El repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face antes de descargarlo.

La informacion publica disponible es limitada: no se detallan la licencia, los datos de entrenamiento ni resultados de benchmarks, por lo que esta ficha recoge lo que puede inferirse de los metadatos y del modelo base, marcando explicitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (herencia de Gemma 4 E2B; detalles no disponibles) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base se distribuye en 4 bits (bnb-4bit); el repo contiene safetensors (posiblemente en BF16/FP16, no confirmado) |
| Idiomas soportados | Ingles (en) y singales (si) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E2B en su variante instruct, un transformer multimodal capaz de procesar entradas de imagen y texto. El ajuste se ha realizado sobre la version cuantizada en 4 bits de Unsloth, lo que sugiere un flujo de entrenamiento con tecnicas de bajo rango o cuantizacion eficiente (el tag `unsloth` asi lo indica), aunque no se especifican los detalles del metodo (LoRA, QLoRA u otro).

La modalidad de entrenamiento declarada es *continued pre-training* (CPT), es decir, un entrenamiento adicional sobre el modelo instruct para adaptarlo a dominios o idiomas especificos, en este caso el singales. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO posteriores. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles y singales.
- Procesamiento de imagenes junto con texto (image-text-to-text), heredado del modelo base Gemma 4.
- Razonamiento y respuesta a instrucciones (variante instruct).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible, aunque el modelo base Gemma 4 suele incluirlo.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a ingles y singales segun los tags.
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Atencion al cliente en singales: el modelo puede gestionar conversaciones multi-turno en un idioma de bajos recursos, cubriendo un nicho que los modelos generalistas rara vez atienden con calidad.
- Traduccion ingles-singales: util para localizar documentacion, interfaces o contenidos para comunidades de Sri Lanka.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer informacion de capturas, formularios o imagenes junto con texto en ambos idiomas.
- Asistentes educativos bilingues: generacion de material didactico y explicaciones en singales para estudiantes.
- Moderacion y clasificacion de contenido: analisis de texto e imagenes en entornos donde el singales es predominante.
- Prototipado rapido en investigacion: al ser un modelo de ~5.100 millones de parametros, permite experimentar con ajustes y evaluaciones en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~5.100 millones de parametros, en FP16 requiere aproximadamente 10-11 GB; en cuantizacion 4 bits, en torno a 3-4 GB mas overhead.
- GPU recomendadas: A100, H100 o L40S para produccion con alto throughput; RTX 4090, RTX 3090 o RTX 4080 para desarrollo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion 4 bits; 12-16 GB para FP16.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si el modelo base lo soporta), llama.cpp/Ollama (previa conversion a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Tharushi-Gemma4-E2B-CPT | ~5.100 M | no disponible | en, si | no disponible | Gated |
| Gemma 4 E2B (base) | ~5.100 M | no disponible | multilingue | Gemma Terms | Abierto (con condiciones) |
| Modelos multilingues de ~7B (p. ej. Qwen, Llama) | 7.000-8.000 M | 8K-128K | multilingue | variable | Abierto |

La comparativa directa con alternativas es limitada porque no se dispone de datos de rendimiento del modelo. Su principal diferenciador es la especializacion en singales, no la competitividad en benchmarks generales.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos; al entrenarse sobre datos de singales e ingles, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de evaluacion publica.
- Cobertura linguistica restringida a ingles y singales; el rendimiento en otros idiomas no esta garantizado.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su adopcion en produccion.
- Al derivar de una version cuantizada en 4 bits, puede arrastrar perdida de precision respecto al modelo original.
- No hay documentacion sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad y posibles contaminaciones.

## Enlaces

- Hugging Face: https://huggingface.co/SynhalaAI/Tharushi-Gemma4-E2B-CPT
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Gemma (familia de modelos): https://ai.google.dev/gemma
