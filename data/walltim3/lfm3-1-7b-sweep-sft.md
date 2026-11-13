# Walltim3/lfm3-1.7b-sweep-sft

## Resumen

`Walltim3/lfm3-1.7b-sweep-sft` es un fine-tune experimental del modelo base `LiquidAI/LFM3-1.7B-Base`, desarrollado por el usuario Walltim3 (no afiliado a Liquid AI). El objetivo declarado es especializar el modelo en tareas de autocompletado de codigo y prediccion de "next-edit" al estilo de Zed, es decir, sugerir el siguiente cambio en un fichero de codigo dentro de un editor. Se distribuye bajo la LFM Open License v1.0, con los umbrales de uso comercial que dicha licencia impone.

El modelo conserva el tamano del base: 1.728.801.536 parametros totales (aproximadamente 1,7 mil millones). La model card lo etiqueta explicitamente como "work in progress" y experimental, sin garantias de calidad. Cada ejecucion de entrenamiento se publica como una etiqueta git del repositorio, de modo que el usuario debe cargar una revision concreta (`revision="<tag>"`) en lugar de la rama principal.

La relevancia actual es limitada pero concreta: se trata de un intento de adaptar un modelo pequeno a tareas de asistencia en editor (FIM y next-edit) con datos de `bigcode/commitpack` y `KodCode-V1`. La informacion disponible sobre arquitectura interna, contexto, idiomas y benchmarks es escasa o inexistente en la model card, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base LiquidAI/LFM3-1.7B-Base; la model card no la describe) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm-open-license-v1.0`), con umbral de uso comercial |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base mas alla de identificarlo como `LiquidAI/LFM3-1.7B-Base`. El fine-tune se organiza en varias ejecuciones identificadas por etiquetas git: `code-sft` (SFT en formato chat sobre 36.000 soluciones de KodCode-V1, ya superada), `code-fim` (planificada, con codigo en bruto y fill-in-the-middle en el diseno `qwen` de Zed, usando ficheros con licencias permisivas de `bigcode/commitpack`) y `sweep-sft-*` (planificadas, para next-edit en el formato de prompt `sweep` de Zed, tambien sobre commits permisivos de `bigcode/commitpack`).

No se documentan hiperparametros, numero de tokens de entrenamiento, composicion exacta del dataset, ni si hubo RLHF/DPO. Tampoco se describen innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). El repositorio incluye un directorio `checkpoints/` con estado de entrenamiento en curso y un tamano total de 83,0 GB, lo que sugiere la acumulacion de multiples revisiones y checkpoints intermedios.

## Capacidades

- Generacion de texto y codigo en formato conversacional (variante `code-sft`).
- Relleno de huecos en codigo (fill-in-the-middle) segun el diseno `qwen` de Zed (variante `code-fim`, planificada).
- Prediccion de next-edit en el formato de prompt `sweep` de Zed (variantes `sweep-sft-*`, planificadas).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Autocompletado de codigo en editor: la variante `code-fim` esta pensada para rellenar huecos en ficheros abiertos con el diseno FIM de Zed, integrandose en el flujo de edicion como motor de sugerencias a nivel de linea o bloque.
- Prediccion de next-edit en IDE: las variantes `sweep-sft-*` se entrenan para sugerir el siguiente cambio coherente con el contexto de un commit, lo que encaja en editores que ofrecen "siguiente edicion" (estilo Zed sweep) sobre el cursor.
- Asistente de refactorizacion local: al ser un modelo de 1,7 B de parametros, puede desplegarse en estaciones de trabajo para proponer cambios acotados sin enviar codigo a la nube, util en entornos con requisitos de privacidad.
- Generacion de parches en pipelines de CI: un modelo de next-edit puede preproponer parches a partir de un diff y un mensaje de commit, para revision humana antes de aplicarlos.
- Prototipado de herramientas de completado: sirve como banco de pruebas para evaluar formatos FIM y sweep antes de invertir en modelos mayores.
- Experimentacion academica sobre SFT de codigo: el repositorio conserva checkpoints intermedios y etiquetas por ejecucion, lo que facilita estudiar el efecto de distintas mezclas de datos (KodCode frente a commitpack) en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73 mil millones de parametros, en FP16 se requieren aproximadamente 3,5 GB solo para pesos; en BF16, similar. En cuantizacion de 8 bits, alrededor de 1,8 GB; en 4 bits, alrededor de 1,0-1,2 GB. Estas cifras son estimaciones por tamano y no estan confirmadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con margen para el contexto; A100/H100 no son necesarias por tamano, pero pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores en FP16; en cuantizacion 4 bits, en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada). vLLM, llama.cpp, Ollama o TGI no estan confirmados para este fine-tune, y la ausencia de pesos GGUF en el repo limita el uso directo en llama.cpp/Ollama sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walltim3/lfm3-1.7b-sweep-sft | 1,73 B | no disponible | FIM y next-edit sobre LFM3-1.7B-Base | LFM Open License v1.0 (umbral comercial) | Hugging Face, experimental |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Modelos FIM de codigo de ~1-2 B (p. ej. variantes Qwen-Coder pequenas) | ~1-2 B | variable | FIM y completado | variable (Apache 2.0 en algunos) | Hugging Face |
| Modelos next-edit especializados (p. ej. Zeta de Zed) | no disponible | no disponible | Next-edit | no disponible | no disponible |

La comparativa con alternativas concretas no puede completarse con datos verificados en la informacion proporcionada; los modelos citados como referencia de categoria no se detallan aqui con cifras porque no estan en la fuente.

## Limitaciones y advertencias

- Modelo experimental y "work in progress": el autor no garantiza calidad ni idoneidad para ningun proposito.
- La variante `code-sft` se entreno sobre KodCode-V1, que es CC BY-NC 4.0, por lo que esa revision concreta queda restringida a uso no comercial.
- La licencia LFM Open License v1.0 incluye un umbral de uso comercial que debe revisarse antes de desplegar en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico; al ser un modelo pequeno especializado en codigo, es esperable que falle en tareas generales fuera de dominio, aunque esto no esta documentado.
- El repositorio pesa 83,0 GB por la acumulacion de checkpoints y revisiones; conviene descargar solo la revision necesaria.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; debe auditarse antes de usarlo en entornos sensibles.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- No esta afiliado ni respaldado por Liquid AI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Walltim3/lfm3-1.7b-sweep-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de Hugging Face
- Dataset KodCode-V1 (usado en `code-sft`): no disponible enlace directo en la informacion
- Dataset bigcode/commitpack (usado en variantes planificadas): no disponible enlace directo en la informacion
