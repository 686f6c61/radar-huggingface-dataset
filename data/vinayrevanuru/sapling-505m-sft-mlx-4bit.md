# VinayRevanuru/Sapling-505M-SFT-MLX-4bit

## Resumen

Sapling-505M-SFT-MLX-4bit es una compilacion cuantizada a 4 bits en formato MLX del modelo conversacional Sapling-505M-SFT, un modelo de 505 millones de parametros con arquitectura Qwen3 dense entrenado desde cero por VinayRevanuru. El modelo original se entreno con 5.000 millones de tokens de preentrenamiento, 1.000 millones de mid-training y 500 millones de tokens de SFT, empleando la plantilla ChatML estandar. Esta version esta pensada especificamente para ejecutarse en Macs con Apple Silicon mediante la libreria mlx-lm.

El interes de esta ficha reside en que documenta de forma inusualmente honesta las limitaciones de un modelo pequeno: el autor declara explicitamente que el checkpoint original supera solo 3 de las 6 puertas de calidad definidas para su publicacion, y que la cuantizacion a 4 bits introduce una perdida adicional medible. No es un modelo para produccion, sino un checkpoint de investigacion util para estudiar el comportamiento de modelos sub-1B, el efecto de la cuantizacion en modelos diminutos y el despliegue local en hardware de consumo.

El repositorio ocupa 304 MB, lo que lo hace trivial de descargar y ejecutar en cualquier Mac moderno, pero esa ventaja de tamano viene acompanada de una perplexity un 6,5 % superior a la del modelo FP32 original y de un deterioro notable en respuestas factuales cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 dense (transformer decoder-only), 30 capas, anchura 1.024, 16 cabezas de consulta y 8 de clave/valor, embeddings atados |
| Parametros totales | 505.483.776 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64, 5,0 bits efectivos por peso; existe variante MLX 8-bit (545 MB) y GGUF (llama.cpp/Ollama) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); tambien disponible GGUF y FP32 original |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 dense: un transformer decoder-only de 30 capas con anchura 1.024, 16 cabezas de atencion de consulta y 8 de clave/valor (GQA), embeddings atados entre entrada y salida, y una ventana de contexto de 2.048 tokens. Esta construido enteramente desde cero, sin destilacion ni inicializacion a partir de un modelo mayor, segun declara el autor.

El entrenamiento se reparte en tres fases: 5.000 millones de tokens de preentrenamiento, 1.000 millones de mid-training y 500 millones de tokens de SFT con plantilla ChatML estandar. No se documentan en la informacion disponible detalles sobre la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La cuantizacion se genero con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` sobre mlx-lm 0.32.2, partiendo de los safetensors FP32 originales.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML y parada correcta en `<|im_end|>` (96 % de las 50 pruebas generales tras la cuantizacion).
- Respuestas coherentes y cierre de turno en la mayoria de prompts generales.
- Generacion de codigo basico (el ejemplo de la model card es una funcion Python que invierte una cadena).
- Capacidad limitada de autoidentificacion: solo acierta que se llama Sapling en 4 de 10 sondas de identidad.
- Capacidad limitada de rechazo de peticiones daninas: declina el 60 % de 30 prompts daninos (frente al 73 % del original).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion con modelos sub-1B en Apple Silicon: cargar el modelo con `mlx_lm.load` y medir latencia, throughput y calidad en un Mac para estudiar el comportamiento de modelos diminutos antes de escalar a tamanos mayores.
- Investigacion sobre cuantizacion: comparar la perplexity y las tasas de acierto en las puertas de chat entre las variantes FP32, MLX 8-bit y MLX 4-bit para cuantificar el coste real de la cuantizacion agresiva en modelos pequenos.
- Prototipado rapido de interfaces conversacionales: usar `mlx_lm.chat` para levantar un chat local sin infraestructura, valido para demos internas o pruebas de UX donde la precision factual no sea critica.
- Docencia y formacion: ilustrar en un curso o taller el ciclo completo de un modelo desde cero (preentrenamiento, mid-training, SFT, cuantizacion y evaluacion con puertas de calidad) con un artefacto de solo 304 MB.
- Pruebas de robustez y seguridad: emplear los conjuntos de 30 prompts daninos y 30 prompts "edgy" inofensivos del autor como base para estudiar falsos rechazos y fallos de alineamiento en modelos pequenos.
- Generacion de texto auxiliar de bajo coste: tareas de reescritura, resumen corto o completado de plantillas en local, donde el contexto de 2.048 tokens sea suficiente y no se requiera alta fidelidad factual.
- Evaluacion comparativa de runtimes: reproducir el mismo prompt en transformers, MLX y llama.cpp (via el GGUF del mismo autor) para comparar perplexity y comportamiento entre backends.

## Benchmarks y rendimiento

| Metrica | FP32 original | MLX 4-bit (este repo) | MLX 8-bit |
|---|---|---|---|
| Tamano | 2,0 GB | 304 MB | 545 MB |
| WikiText-2 PPL | 23,79 | 25,32 (+6,5 %) | 23,79 (+0,0 %) |
| Termina turno con `<|im_end|>` (50 prompts) | 98 % | 96 % | no disponible |
| Fuga de rol | 0 | 0 | no disponible |
| Se identifica como Sapling (10 sondas) | 3/10 | 4/10 | no disponible |
| Declina prompts daninos (30) | 73 % | 60 % | no disponible |
| Rechaza erroneamente prompts inofensivos "edgy" (30) | 33 % | 47 % | no disponible |

La perplexity se midio sobre las primeras 64 ventanas de 1.024 tokens del test de WikiText-2 (raw), puntuando la segunda mitad de cada ventana, con el mismo metodo que `llama-perplexity`. El autor advierte que los conjuntos de prompts son pequenos (un prompt mueve la tasa 3,3 puntos) y que diferencias de ±10 puntos entre columnas estan dentro del ruido de muestreo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 304 MB de pesos en 4 bits; con overhead de runtime, menos de 1 GB de memoria unificada en la practica.
- GPU recomendadas: cualquier Apple Silicon (serie M1 en adelante); no esta pensado para GPU NVIDIA ni CUDA, ya que el formato es MLX.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- Opciones de despliegue: `mlx-lm` (libreria nativa), `mlx_lm.chat` para CLI interactiva; para llama.cpp u Ollama debe usarse la variante GGUF del mismo autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Sapling-505M-SFT-MLX-4bit | 505 M | 2.048 | MLX 4-bit | Apache-2.0 | Checkpoint de investigacion; 3/6 puertas superadas; PPL 25,32 |
| Sapling-505M-SFT-MLX-8bit | 505 M | 2.048 | MLX 8-bit | Apache-2.0 | Misma calidad que FP32 (PPL 23,79); 545 MB; recomendado por el autor |
| Sapling-505M-SFT (FP32) | 505 M | 2.048 | safetensors (transformers) | Apache-2.0 | Modelo original; 2,0 GB; referencia de calidad |
| Sapling-505M-SFT-GGUF | 505 M | 2.048 | GGUF (llama.cpp/Ollama) | Apache-2.0 | Variante BF16 que reproduce la PPL del FP32 con error < 0,01 % |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros autores (Qwen2.5-0.5B, SmolLM2-360M, etc.).

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor declara que el modelo original supera solo 3 de las 6 puertas de calidad definidas; no esta pensado para produccion.
- Perdida por cuantizacion: la perplexity sube un 6,5 % respecto al FP32 y las respuestas factuales cortas cambian con frecuencia (ejemplo documentado: responde "Sydney" donde el original dice "Canberra").
- Autoidentificacion deficiente: solo acierta su propio nombre en 4 de 10 sondas.
- Alineamiento de seguridad insuficiente: declina solo el 60 % de prompts daninos (frente al 73 % del original) y rechaza erroneamente el 47 % de prompts inofensivos que suenan agresivos.
- Solo ingles: no hay soporte multilingue declarado.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion elevado por tamano y por la cuantizacion agresiva en un modelo ya diminuto.
- Licencia Apache-2.0: permite uso comercial, pero las limitaciones tecnicas y de alineamiento desaconsejan ese uso sin evaluacion adicional.
- El autor recomienda la variante 8-bit (545 MB) salvo que la memoria sea muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT-MLX-4bit
- Modelo base (FP32): https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- Variante MLX 8-bit: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT-MLX-8bit
- Variante GGUF: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT-GGUF
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
