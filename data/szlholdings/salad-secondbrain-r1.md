# SZLHOLDINGS/salad-secondbrain-r1

## Resumen

salad-secondbrain-r1 es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Se presenta como un artefacto de entrenamiento en fase candidata, no como un modelo de produccion publicado, y forma parte del programa de entrenamiento "Salad" de la organizacion, que segun la model card se ejecuta sobre contenedores GPU de Salad bajo una doctrina de "receipted-training" con medicion de energia mediante NVML y Zeus.

El adaptador se distribuye en formato PEFT/LoRA y esta pensado para su carga sobre Qwen3-1.7B, un transformer denso de 1.700 millones de parametros con ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en el modelo base, aunque la model card del adaptador no lo especifica). El repositorio incluye una escalera de checkpoints intermedios (50, 100, 150 y 200 pasos) ademas del directorio `final/`, lo que permite reproducir la evolucion del entrenamiento.

Su relevancia es limitada por ahora: cero descargas, cero likes y una model card minima que no documenta datos de entrenamiento, hiperparametros, benchmarks ni capacidades especificas. Resulta util como referencia de trazabilidad de un pipeline de entrenamiento gobernado, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen3-1.7B soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizable via el base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con la libreria PEFT sobre el modelo Qwen3-1.7B. No se especifican en la model card el rango LoRA, los modulos objetivo, la tasa de aprendizaje ni el numero de tokens de entrenamiento. El repositorio ocupa 0,6 GB, coherente con una escalera de checkpoints de un adaptador de baja dimension sobre un modelo de 1,7 mil millones de parametros.

El entrenamiento se ejecuto, segun el autor, en contenedores GPU de Salad bajo una doctrina interna denominada "fail-closed receipted-training", que exige recibos honestos y medicion de energia real mediante NVML y Zeus con doble metrica. Los recibos de heartbeat y finalizacion se alojan en los logs de la lane SZLHOLDINGS/frontier-54-runs. No se documenta el dataset, la composicion linguistica ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles heredada del modelo base Qwen3-1.7B.
- Razonamiento y codigo basicos, limitados por el tamano del modelo base.
- Soporte de tool calling y modo thinking del base Qwen3, aunque no verificado especificamente para este adaptador.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- No se documentan capacidades de vision, audio ni agentes multi-paso especificas del adaptador.

## Casos de uso

- Evaluacion de pipelines de entrenamiento gobernado: el adaptador sirve para auditar la trazabilidad de un entrenamiento con recibos de energia, comparando checkpoints intermedios (50/100/150/200) frente al `final/` para estudiar la curva de convergencia.
- Prototipado rapido en entornos con GPU de consumo: al ser un LoRA sobre un modelo de 1,7 mil millones, puede cargarse en una RTX 3060 de 12 GB o superior para experimentacion en generacion de texto en ingles.
- Investigacion sobre adaptadores PEFT: util como caso de estudio de un adaptador LoRA con licencia Apache 2.0 y checkpoints intermedios publicos para analisis de estabilidad del entrenamiento.
- Base para fine-tuning posterior: el adaptador puede servir como punto de partida para tareas especificas en ingles, aunque su escasa documentacion limita la confianza.
- Demostraciones de inferencia local: con llama.cpp u Ollama (tras fusion y conversion a GGUF) puede desplegarse en portatiles con GPU integrada para pruebas de concepto.
- Reproducibilidad de artefactos: el repositorio permite verificar la correspondencia entre checkpoints y recibos de la organizacion, util en equipos que exigen auditoria de procedencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en FP16 para el modelo base fusionado con el adaptador; unos 2 GB en cuantizacion de 4 bits (Q4_K_M).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM en FP16 y desde 2 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador directamente; vLLM, TGI, llama.cpp y Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-secondbrain-r1 (LoRA sobre Qwen3-1.7B) | Adaptador sobre 1,7 mil millones | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-1.7B (base) | 1,7 mil millones | 32.768 tokens nativos | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2 1B | 1,2 mil millones | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Gemma 3 1B | 1 mil millones | 32.000 tokens | Gemma Terms of Use | Hugging Face, ampliamente usado |

## Limitaciones y advertencias

- Artefacto en fase candidata: el propio autor lo declara "not a published production model"; no debe usarse en produccion sin validacion adicional.
- Documentacion minima: no se detallan datos de entrenamiento, hiperparametros, rango LoRA ni evaluaciones, lo que impide valorar su calidad real.
- Riesgo de alucinacion: inherente al modelo base Qwen3-1.7B, agravado por la ausencia de evaluaciones del adaptador.
- Sesgos: no documentados; el modelo base Qwen3 incorpora sesgos de sus datos de preentrenamiento.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador hereda las condiciones del modelo base Qwen3-1.7B, que conviene revisar.
- Cero adopcion: sin descargas ni likes, no hay evidencia de uso en la comunidad ni de validacion externa.
- Fecha de creacion inusual (2026-11-15) en los metadatos, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-secondbrain-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Lane de logs de entrenamiento: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
