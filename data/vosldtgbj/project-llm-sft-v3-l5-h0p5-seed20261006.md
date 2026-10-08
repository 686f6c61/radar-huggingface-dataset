# vosldtgbj/project-llm-sft-v3-l5-h0p5-seed20261006

## Resumen
Project LLM SFT v3 (identificador `L5--h0p5--seed20261006`) es un checkpoint experimental publicado por el usuario `vosldtgbj` en HuggingFace. Se trata de un ajuste supervisado (SFT) de tipo any-to-any construido sobre la arquitectura `gemma4_unified` de Gemma 4, con aproximadamente 11.959.730.176 parametros (unos 11,96 mil millones) y pesos almacenados en Safetensors.

El modelo parte de un checkpoint intermedio de preentrenamiento continuado denominado `CPT 1.0`, sobre el que se aplico un SFT de 0.5 epocas con una mezcla de datos compuesta por un 90 por ciento de datos de dominio especifico y un 10 por ciento de datos generales. El entrenamiento se realizo mediante LoRA con rango 128, alpha 256, dropout 0.05 y tasa de aprendizaje 2e-5, y los adaptadores se fusionaron posteriormente en pesos completos.

Su relevancia es acotada: se publica como archivo de pesos para reproducir experimentos, realizar evaluaciones offline e investigacion posterior. No incluye datos de optimizador ni estados de reanudacion, y no presenta resultados de benchmarks ni metricas de rendimiento en la informacion disponible. La etiqueta de idioma japones sugiere un sesgo hacia ese idioma, aunque el listado completo de idiomas soportados no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified`, tarea any-to-any (imagen-texto) |
| Parametros totales | 11.959.730.176 (~11,96 mil millones) |
| Parametros activos | No aplicable (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en Safetensors) |
| Idiomas soportados | no disponible (etiqueta `japanese` en el repositorio) |
| Licencia | apache-2.0, sujeta ademas a los terminos de licencia de Gemma 4 |
| Formato de pesos | Safetensors (fragmentado) |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura `gemma4_unified`, que corresponde a la familia Gemma 4 de Google y requiere una version de Transformers que soporte dicha arquitectura, cargandose mediante `AutoProcessor` y `AutoModelForMultimodalLM`. Se trata, por tanto, de un modelo multimodal nativo que acepta entradas de imagen y texto y produce salidas any-to-any. No se detalla en la informacion disponible el numero de capas, dimensiones de atencion, tamano de vocabulario ni si incorpora mecanismos de atencion lineal o decodificacion especulativa.

El proceso de entrenamiento consta de dos etapas encadenadas. Primero un preentrenamiento continuado (CPT 1.0, checkpoint `cpt1-full-02`), y despues un SFT v3 sobre una mezcla de 90 por ciento de datos de dominio y 10 por ciento de datos generales, durante 0.5 epocas. El ajuste se hizo con LoRA (r=128, alpha=256, dropout=0.05, LR=2e-5) y los adaptadores se fusionaron en los pesos finales. No se especifican el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades
- Generacion de texto de forma autoregresiva sobre arquitectura Gemma 4.
- Procesamiento multimodal de imagen y texto (tarea any-to-any).
- Ajuste especifico sobre datos de dominio (90 por ciento de la mezcla de SFT), orientado a un caso de uso concreto no detallado.
- Soporte del idioma japones segun la etiqueta del repositorio; el resto de idiomas no esta confirmado.
- Carga estandar mediante `transformers` con `AutoModelForMultimodalLM` y `device_map="auto"`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Reproduccion de experimentos de investigacion: el repositorio se publica explicitamente para replicar el pipeline CPT + SFT y verificar resultados de forma offline.
- Evaluacion comparativa de tecnicas de SFT: permite medir el efecto de una mezcla 90/10 de datos de dominio frente a datos generales sobre un mismo modelo base.
- Experimentacion con LoRA fusionado: sirve para estudiar el comportamiento de adaptadores de rango 128 y alpha 256 una vez fusionados en los pesos completos.
- Evaluacion de modelos multimodales any-to-any: al aceptar imagen y texto, es util para probar tareas de descripcion de imagenes o respuesta visual sobre una variante afinada de Gemma 4.
- Investigacion en procesamiento de japones: dado el etiquetado de idioma, puede emplearse para estudiar el comportamiento en ese idioma tras el ajuste de dominio.
- Base para posteriores fine-tunes: al distribuir pesos completos en Safetensors, puede reutilizarse como punto de partida de nuevos ajustes supervisados o de alineacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (calculada a partir de los ~11,96 mil millones de parametros, no datos oficiales): aproximadamente 24 GB en bf16/fp16, unos 12 GB en cuantizacion de 8 bits y unos 7 GB en cuantizacion de 4 bits.
- El repositorio ocupa 24,0 GB, coherente con pesos en precision de 16 bits.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para despliegue en precision completa; GPU con 24 GB o mas (RTX 3090, RTX 4090) para inferencia en 8 bits o con cuantizacion.
- Cabe en GPU de consumo si se cuantiza: 4 bits permite ejecutarlo en tarjetas de 8-12 GB, aunque no se distribuyen pesos GGUF en el repositorio.
- Opciones de despliegue: al ser un modelo multimodal Gemma 4, la carga requiere Transformers. Para servicio de alto rendimiento se puede valorar vLLM o TGI, aunque no hay confirmacion de compatibilidad con esta variante concreta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparativa fiable. El modelo deriva del checkpoint base `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02` y, en ultima instancia, de la arquitectura Gemma 4; la comparacion con otros modelos de la misma categoria no esta disponible en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Project LLM SFT v3 (`L5--h0p5--seed20261006`) | ~11,96 B | no disponible | apache-2.0 + terminos Gemma 4 | HuggingFace |
| Checkpoint base (`cpt1-full-02`) | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo experimental sin benchmarks publicados; no hay evidencia de rendimiento medible en tareas estandar.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos potenciales derivados del ajuste con 90 por ciento de datos de dominio, que pueden degradar el comportamiento general frente al modelo base.
- Idioma: la etiqueta `japanese` apunta a un enfoque en japones, pero no se confirma la cobertura real de idiomas ni la calidad en castellano.
- Licencia: aunque el repositorio declara apache-2.0, el uso queda sujeto a los terminos adicionales de la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`); conviene revisarlos antes de un uso comercial.
- No se incluyen datos de optimizador ni estado de reanudacion, por lo que no es posible continuar el entrenamiento tal cual.
- Longitud de contexto y tipos de cuantizacion no documentados; esto complica la planificacion de despliegue en produccion.
- Repositorio con 0 descargas y 0 likes, sin comunidad que valide su comportamiento.

## Enlaces
- HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-l5-h0p5-seed20261006
- Modelo base: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-01-full-02
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- vLLM documentacion: https://docs.vllm.ai/en/latest/
