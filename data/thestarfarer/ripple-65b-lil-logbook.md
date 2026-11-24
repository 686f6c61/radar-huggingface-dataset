# thestarfarer/Ripple-65B-lil-logbook

## Resumen

Ripple-65B-lil-logbook es un ajuste fino mediante LoRA del modelo base ricursiveAI/Ripple-65B-Base-Preview, publicado por el usuario thestarfarer en Hugging Face. Se trata de un modelo de 64.782.689.360 parámetros (aproximadamente 65B) orientado a la generación de texto conversacional en formato de rol y foro, sin plantilla de chat convencional: el modelo trabaja con texto plano estructurado mediante encabezados `# nombre` que identifican a cada interlocutor. El autor lo describe como un experimento de ajuste sobre un corpus de rol de foro procedente de un repositorio hermano de menor tamano (Ministral-3-14B-lil-logbook).

El interés del modelo reside en su metodología de entrenamiento documentada con detalle: barridos de rango y tasa de aprendizaje, evaluación por pérdida en varios conjuntos (lil, forum-RP, book) y adaptadores intermedios publicados junto al modelo final. El autor advierte explícitamente que la pérdida no correlaciona con la calidad de generación una vez que los pesos se desplazan lo suficiente, lo que convierte a esta ficha en un caso de estudio sobre evaluación de ajustes finos.

La relevancia práctica es limitada fuera del nicho de la generación de rol y narrativa conversacional: no hay plantilla de chat, no se declaran idiomas soportados y la licencia no está disponible. El repositorio ocupa 916,1 GB e incluye múltiples adaptadores LoRA, checkpoints de reanudación y versiones cuantizadas en GGUF (Q8_0, Q4_K_M y Q3_K_M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `ricursive` en llama.cpp); detalles no disponibles |
| Parametros totales | 64.782.689.360 (~65B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens recomendados en inferencia; entrenado con ventanas de 512 y 2.048 (caps de 544 y 2.112 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 (dos shards: 44,8 + 24,0 GB), Q4_K_M (38,8 GB), Q3_K_M (31,0 GB); adaptadores LoRA en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptadores LoRA y checkpoints) y GGUF (modelos fusionados) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre ricursiveAI/Ripple-65B-Base-Preview (revision `6187d110`), un transformer de aproximadamente 65B parámetros cuya arquitectura interna no se detalla en la información disponible. El entrenamiento se realizó con rsLoRA, alpha = sqrt(512*r) (ganancia forward fijada en 22,6 entre rangos), objetivos q/k/v/o/gate/up/down, batch global de 16, maestro LoRA en fp32 con estado del optimizador, base en bf16 y FSDP nativo. Los adaptadores se cargan con PEFT 0.18.0, transformers 4.57.1 y torch 2.9.1.

El corpus de entrenamiento es el corpus de rol de foro del repositorio hermano Ministral-3-14B-lil-logbook, reutilizado sin cambios; Ripple tokeniza dicho corpus a ~0,99x de los recuentos de Ministral, por lo que se reutilizaron los cortes de ventana de 512 y 2.048 tokens. El proceso incluyó un barrido de rango x tasa de aprendizaje (r32/r64, LR entre 1e-7 y 5e-6, 400 pasos por celda), una pasada completa de 512 tokens (r128, paso 2797), una fase de 2.048 tokens (r128, paso 1042) y una ejecución posterior del 22 de noviembre (r128, paso 1671). El autor publica además el toolkit de entrenamiento ripple-65b-toolkit, un entrenador LoRA multi-GPU que alcanza ~3.900-4.340 tok/s en 4x H100 a contexto 2.048.

## Capacidades

- Generación de texto en formato de rol de foro mediante encabezados `# nombre`, sin plantilla de chat; el prompt debe terminar en el encabezado desnudo del siguiente interlocutor y usar `\n#` como cadena de parada.
- Continuación narrativa y diálogo multi-turno con seguimiento de interlocutores (el autor destaca que mantiene a los hablantes separados).
- Escritura de prosa de calidad media según la evaluación cualitativa del autor.
- Ajuste al estilo del usuario: el autor señala que es "más susceptible a la escritura del usuario" que otros modelos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de rol de foro y narrativa colaborativa: el modelo está entrenado específicamente sobre un corpus de rol de foro y espera texto plano con encabezados de interlocutor, por lo que encaja en aplicaciones de escritura colaborativa o simulación de conversaciones entre personajes.
- Prototipado de ficción interactiva: con contexto de 8.192 tokens y samplers recomendados (temperatura 0,7, min_p 0,1, DRY 0,4/1,75/2/1024), puede mantener escenas largas con varios personajes.
- Investigación sobre ajuste fino LoRA: el repositorio publica barridos de rango y LR, adaptadores intermedios y checkpoints de reanudación, lo que permite reproducir y estudiar la dinámica de entrenamiento sobre un base de 65B.
- Evaluación de metodologías de selección de checkpoints: el autor documenta que la pérdida y la calidad de generación divergen, lo que hace del modelo un caso práctico para estudiar criterios de selección alternativos.
- Generación de diálogos de guion o narrativa breve en local: las cuantizaciones Q4_K_M (38,8 GB) y Q3_K_M (31,0 GB) permiten ejecución en llama.cpp o koboldcpp en hardware de gama alta de consumo.
- Experimentación con decodificación y samplers: la documentación detalla ajustes de repetición, DRY y breakers, útil para estudiar el efecto de los samplers en modelos de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica únicamente pérdidas en nats/token sobre conjuntos propios:

| Modelo / adaptador | lil | forum-RP | book |
|---|---|---|---|
| base | 2,2995 | 2,5436 | 2,4845 |
| r32-lr3.7e-7 | 2,0554 | 2,5596 | 2,5052 |
| r32-lr1.4e-6 | 1,9818 | 2,6211 | 2,5262 |
| r32-lr5e-6 | 1,9091 | 2,6705 | 2,5590 |
| r64-lr1e-7 | 2,1646 | 2,5367 | 2,4889 |
| r64-lr3.7e-7 | 2,0249 | 2,5784 | 2,5097 |
| r64-lr1.4e-6 | 1,9568 | 2,6309 | 2,5349 |
| r64-lr5e-6 | 1,8903 | 2,6807 | 2,5637 |

Advertencia del autor: el conjunto *lil* no es limpiamente held-out (66% de sus líneas aparecen literalmente en el fichero de entrenamiento del barrido y 48% en la mezcla de la pasada de 512), por lo que esa columna mide ajuste, no generalización. Los niveles de calidad q4 y q2 tienen 10 filas cada uno y sus diferencias deben tratarse como ruidosas.

## Requisitos de hardware

- VRAM estimada: Q8_0 en dos shards (44,8 + 24,0 GB) requiere aproximadamente 69 GB en total; Q4_K_M (38,8 GB) requiere ~39-42 GB; Q3_K_M (31,0 GB) requiere ~31-34 GB, en función del contexto y del backend.
- GPU recomendadas: el entrenamiento se realizó en 4x H100; para inferencia en Q8_0 se necesitan GPU con 80 GB (A100 80GB, H100) o configuraciones multi-GPU.
- GPU de consumo: Q3_K_M y Q4_K_M pueden caber en configuraciones de 48 GB (RTX 6000 Ada, A6000) o en 2x RTX 4090 (24 GB cada una) con reparto de capas; no cabe en una única RTX 4090 de 24 GB.
- Despliegue: llama.cpp (arquitectura `ricursive`) y koboldcpp (compilando la rama `concedo_experimental` desde el código fuente). Para los adaptadores LoRA, PEFT 0.18.0 con transformers 4.57.1 y torch 2.9.1.
- Latencia y throughput: no disponibles para inferencia; el autor reporta ~3.900-4.340 tok/s de entrenamiento en 4x H100 a contexto 2.048.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ripple-65B-lil-logbook | ~65B | 8.192 recomendado | no disponible | Hugging Face (GGUF + LoRA) | Ajuste de rol de foro sin plantilla de chat |
| Ministral-3-14B-lil-logbook | ~14B | no disponible | no disponible | Hugging Face | Repositorio hermano; mismo corpus de rol de foro; el 65B sin entrenar igualó o superó al 14B entrenado en paneles ciegos |
| ricursiveAI/Ripple-65B-Base-Preview | ~65B | no disponible | no disponible | Hugging Face | Modelo base sin ajustar; pérdida lil de 2,2995 frente a 2,1795 del Ministral base (diferencia de 0,12) |

No se dispone de datos de benchmarks estandarizados que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin plantilla de chat: requiere formato de encabezados `# nombre` y cadena de parada `\n#`; el modelo puede no terminar su turno por sí solo.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- Idiomas soportados no declarados; el corpus de entrenamiento es de rol de foro en un idioma no especificado.
- Riesgo de alucinación y de deriva estilística: el autor indica que es "más susceptible a la escritura del usuario" y que puede producir alta calidad sin indicación o solo si se maneja bien.
- La pérdida no es un criterio fiable de selección: el autor documenta que los ganadores de la tabla de pérdida fueron calificados como los más rotos en las rondas de juicio.
- El conjunto de evaluación *lil* no es limpiamente held-out, por lo que las cifras de pérdida sobre ese conjunto no miden generalización.
- Los niveles de calidad q4 y q2 tienen solo 10 filas cada uno; sus diferencias son ruidosas.
- El repositorio ocupa 916,1 GB, lo que exige planificación de almacenamiento para descargar adaptadores y checkpoints.
- Para koboldcpp es necesario compilar la rama `concedo_experimental` desde el código fuente, lo que anade complejidad de despliegue.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thestarfarer/Ripple-65B-lil-logbook
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Repositorio hermano: https://huggingface.co/thestarfarer/Ministral-3-14B-lil-logbook
- Toolkit de entrenamiento: https://github.com/thestarfarer/ripple-65b-toolkit
