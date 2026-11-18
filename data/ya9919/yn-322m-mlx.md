# ya9919/YN-322m-mlx

## Resumen

YN-322m-mlx es un modelo de decisión de aproximadamente 322 millones de parámetros desarrollado por el autor ya9919 en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala social orientado al estudio de decisiones financieras de hogares. El modelo no es un generador de texto conversacional al uso: se trata de un encoder multilingüe (derivado de mmBERT de la familia Laya) con una cabeza de puntuación de alternativas que, dado un estado de hogar y una pregunta de opción múltiple, puntúa todas las opciones candidatas y selecciona una respuesta.

La variante `-mlx` es el runtime MLX en FP16 del checkpoint bilingüe FinL-bilingual (inglés y chino), empaquetado junto al checkpoint nativo en PyTorch. El modelo se ha ajustado sobre datos de encuestas financieras reales mediante dos etapas de SFT y RLCD nativo, con 1.721.623 observaciones de entrenamiento por idioma. Su relevancia actual reside en que sirve como política de decisión reutilizable dentro de simulaciones de población a gran escala (el manuscrito evalúa 12 millones de agentes sintéticos y 24 millones de elecciones), y en que su implementación en MLX CUDA reporta mejoras notables de latencia y throughput frente a PyTorch y frente a una API externa de referencia.

La licencia es propietaria (`s2-mas-controlled-research-v1.2`, catalogada como "other" en Hugging Face) y orientada a investigación controlada, lo que condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT de Laya) con cabeza de puntuación de opciones |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (runtime MLX CUDA); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | s2-mas-controlled-research-v1.2 (categoría "other"; incluye apéndice Apache-2.0 original) |
| Formato de pesos | safetensors (runtime MLX; existe checkpoint nativo emparejado) |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingüe mmBERT de la familia Laya y le añade una cabeza de puntuación de opciones ("option-scoring head"). En lugar de generar texto libre, recibe un estado de hogar junto con una pregunta y un conjunto completo de alternativas candidatas, y produce una puntuación para cada alternativa; la respuesta es la opción con mayor puntuación. Esta interfaz de política es reutilizable entre distintas tareas de elección, lo que permite emplear el mismo modelo para múltiples preguntas de encuesta financiera.

El entrenamiento se realizó sobre datos de encuestas reales, con dos etapas de SFT y RLCD nativo, usando 1.721.623 observaciones de entrenamiento por idioma (inglés y chino). El checkpoint bilingüe se distribuye en dos formatos: nativo (PyTorch) y MLX FP16. La model card menciona además un checkpoint base en inglés de seis rondas ([FinL-mlx](https://huggingface.co/ya9919/YN-421m-mlx)), distinto de esta variante bilingüe. No se detallan en la información disponible innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Puntuación y selección de alternativas en preguntas de elección múltiple sobre estado financiero de hogares.
- Decisión binaria y multiclase (por ejemplo, "¿tiene cuenta de depósito a la vista en renminbi?" con opciones sí/no).
- Procesamiento bilingüe inglés-chino.
- Interfaz de política reutilizable: el mismo modelo sirve para distintas preguntas y tareas de elección.
- Integración en simulaciones multiagente a escala poblacional (S²-MAS).
- Inferencia de baja latencia mediante runtime MLX CUDA en FP16.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Simulación de decisiones financieras de hogares a escala: el modelo actúa como política de decisión de cada agente sintético dentro de S²-MAS, permitiendo evaluar cómo decisiones individuales agregadas producen resultados poblacionales en consumo, efectivo y medios de pago.
- Encuestas sintéticas de comportamiento financiero: dado un estado de hogar y un cuestionario de opción múltiple, el modelo puntúa las alternativas y genera respuestas plausibles para prellenar o augmentar encuestas reales.
- Estudios de política pública y escenarios contrafactuales: al cambiar las condiciones del entorno en la simulación, se evalúa cómo varían las elecciones de los hogares sin necesidad de recoger nuevos datos primarios.
- Investigación académica en economía del comportamiento: la interfaz de puntuación de alternativas permite medir preferencias y comparar distribuciones de respuestas entre poblaciones sintéticas.
- Evaluación de modelos de decisión frente a encuestas reales: el modelo puede usarse como línea base entrenada en datos de encuesta y compararse con alternativas generativas o APIs externas.
- Despliegue de bajo coste en entornos con GPU: gracias al runtime MLX FP16 y sus 322M de parámetros, puede ejecutarse en una sola GPU (la model card reporta pruebas en A100 PCIe 40GB) para servir decisiones a alta concurrencia.

## Benchmarks y rendimiento

Resultados reportados en la model card para el checkpoint bilingüe emparejado (referencia nativa PyTorch BF16, idioma chino):

| Test | Idioma de entrada | Backend / precisión | QA (denominador) | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Checkpoint nativo emparejado | Chino | PyTorch BF16 | 240.458 | 119 | 74,52% | 37,99% |

La model card indica además que, según la Figura 5, el test compartido en chino mejora 21,61 puntos porcentuales de accuracy y 10,60 puntos de F1 respecto al modelo base multilingüe.

Tiempos de despliegue (prueba del 11 de octubre de 2026, una NVIDIA A100 PCIe 40GB, FP16, batch y concurrencia uno, tres casos financieros chinos fijos, tres calentamientos y veinte repeticiones cronometradas por caso, 60 llamadas por brazo):

| Checkpoint / referencia | Latencia media (ms) | Elecciones/s | Tokens de entrada compartidos/s |
|---|---:|---:|---:|
| FinL-bilingual · PyTorch FP16 | 22,06 | 45,33 | 15.247,34 |
| FinL-bilingual-mlx · MLX CUDA FP16 | 9,10 | 109,88 | 36.955,47 |
| Jev 1.13 · API | 206,77 | 4,84 | 1.626,63 |

MLX alcanza 22,72 veces el throughput de tokens de entrada compartidos de la API Jev y 2,42 veces el throughput del mismo checkpoint en PyTorch. Los tiempos incluyen preparación de entrada, tokenización, predicción sincronizada y formateo de respuesta; la carga queda excluida y Jev incluye el viaje de red.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,65 GB solo para pesos (322M parámetros × 2 bytes), más memoria para activaciones y tokenización; no se publica una cifra oficial de VRAM total.
- GPU de referencia en las pruebas: NVIDIA A100 PCIe 40GB con MLX CUDA FP16.
- Por su tamaño, es probable que quepa en GPU de consumo (por ejemplo, RTX 4090 o RTX 3090) en FP16, aunque no se documentan pruebas en dichas GPU.
- Opciones de despliegue documentadas: Laya-MLX / MLX CUDA con `predict_example.py` y `example_request.json`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput reportados: 9,10 ms de latencia media y 109,88 elecciones/s en A100 PCIe 40GB con MLX CUDA FP16 (batch y concurrencia uno).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-322m-mlx (este modelo) | 321,9M | No disponible | 74,52% accuracy / 37,99% F1 macro (chino, checkpoint nativo BF16) | s2-mas-controlled-research-v1.2 | Hugging Face (ya9919) |
| FinL-bilingual (checkpoint nativo PyTorch) | ~322M | No disponible | Mismo checkpoint entrenado; 22,06 ms y 45,33 elecciones/s en A100 FP16 | s2-mas-controlled-research-v1.2 | Hugging Face (ya9919/YN-322m) |
| FinL-mlx (base inglesa, seis rondas) | ~421M | No disponible | No disponible en esta información | No disponible | Hugging Face (ya9919/YN-421m-mlx) |
| Jev 1.13 (API externa) | No disponible | No disponible | 206,77 ms y 4,84 elecciones/s en la misma prueba | No disponible | API |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría (modelos de decisión financiera) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión especializado en elecciones financieras de hogares; no es un modelo generativo general y no debe emplearse como chatbot o asistente.
- Solo admite inglés y chino; no hay soporte documentado para otros idiomas.
- Riesgo de alucinación estructural: al puntuar alternativas, puede seleccionar opciones incorrectas cuando el estado del hogar es atípico o incompleto.
- Los resultados de accuracy (74,52%) y F1 macro (37,99%) indican un rendimiento desigual entre versiones de pregunta; el F1 macro bajo sugiere dificultades en clases minoritarias.
- Entrenado sobre encuestas financieras reales, por lo que puede heredar sesgos de la población encuestada y de la composición del dataset.
- Licencia `s2-mas-controlled-research-v1.2` orientada a investigación controlada: el uso comercial está restringido y requiere revisar el fichero LICENSE del repositorio.
- La model card advierte de que los ejemplos QA publicados pertenecen a hogares reales y que es necesario proporcionar un estado de hogar para la inferencia; no deben tratarse como instrucciones.
- El rendimiento de latencia reportado corresponde a una A100 PCIe 40GB con MLX CUDA FP16 y concurrencia uno; no se garantiza en otros entornos.
- Longitud de contexto no documentada, lo que limita la planificación de despliegues con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-322m-mlx
- Checkpoint nativo emparejado: https://huggingface.co/ya9919/YN-322m
- Checkpoint base inglés (FinL-mlx): https://huggingface.co/ya9919/YN-421m-mlx
- Repositorio GitHub del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Manuscrito S²-MAS (PDF): https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Licencia: https://huggingface.co/ya9919/YN-322m-mlx/blob/main/LICENSE
