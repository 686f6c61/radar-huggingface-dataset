# tyrant35/zils-lite-probe-wg

## Resumen

zils-lite-probe-wg es un modelo de decisión derivado de `joamCriff123/zils-lite-l1117a`, un cuerpo base de la familia Zils en su variante `d3-lite`. Lo publica el usuario tyrant35 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo conversacional al uso: es un experimento controlado para medir cómo responde el "banco de rondas" (round bank) de la arquitectura d3-lite ante un ajuste fino supervisado sobre una tarea concreta de decisión binaria.

El proceso de construcción combina un fine-tune LoRA de rango 32 (learning rate 1e-4) entrenado sobre las 6.000 filas del split de entrenamiento de WinoGrande XL con etiquetas gold, junto con las probabilidades de respuesta del propio modelo base sobre 6.000 prompts públicos de decisión, para preservar su comportamiento previo. Posteriormente se aplica una extrapolación de la dirección del cambio: `soup + 3 × (fine-tune − soup)`, una técnica de model arithmetic que amplifica el vector de ajuste más allá del punto de fine-tune.

El modelo tiene 852.985.920 parámetros (aproximadamente 853 M) y un repositorio de 1,7 GB en safetensors. El autor lo describe explícitamente como un experimento de sondeo ("probe") y advierte de que no se espera que supere al modelo base. Es relevante para investigadores interesados en dinámicas de fine-tuning, extrapolación de pesos y evaluación de arquitecturas no convencionales, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | d3-lite (familia Zils, "soup-pool body"); detalles internos no disponibles |
| Parámetros totales | 852.985.920 (~853 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `joamCriff123/zils-lite-l1117a`, descrito por el autor como un "soup-pool body" de la variante d3-lite. La model card no detalla la arquitectura interna (si es transformer, híbrida u otra), ni la composición del corpus original, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el procedimiento de ajuste: un LoRA de rango 32 con learning rate 1e-4 entrenado sobre 6.000 filas del split de entrenamiento de WinoGrande XL con etiquetas gold, complementado con 6.000 prompts públicos de decisión anotados con las propias probabilidades del modelo base para evitar el olvido catastrófico del comportamiento previo.

La innovación técnica destacable es la extrapolación del vector de cambio: en lugar de quedarse en el punto de fine-tune, el autor calcula `soup + 3 × (fine-tune − soup)`, es decir, amplifica tres veces la dirección del ajuste respecto al modelo base. No se usaron splits de test ni de validación durante el entrenamiento, lo que refuerza el carácter exploratorio del artefacto. El autor indica que el objetivo es medir la respuesta del round bank de d3-lite a estos datos, no obtener un modelo competitivo.

## Capacidades

- Modelo de decisión binaria orientado a tareas del estilo WinoGrande (resolución de correferencia y elección entre dos opciones).
- Generación de probabilidades de respuesta sobre prompts de decisión, según el procedimiento de destilación descrito en la model card.
- Preservación del comportamiento del modelo base mediante el entrenamiento con sus propias probabilidades sobre 6.000 prompts públicos.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- No se documenta soporte de agentes.

## Casos de uso

- Investigación sobre extrapolación de pesos: el modelo sirve como caso de estudio reproducible de la técnica `base + k × (fine-tune − base)` con k = 3, útil para estudiar cómo se comporta la amplificación del vector de ajuste en arquitecturas no convencionales.
- Análisis de olvido catastrófico: la inclusión de 6.000 prompts con las probabilidades del modelo base permite comparar la deriva del comportamiento antes y después del ajuste, y evaluar si la destilación de probabilidades mitiga la pérdida de capacidades previas.
- Sondeo de arquitecturas d3-lite: investigadores que trabajen con la familia Zils pueden usar este "probe" para medir la sensibilidad del round bank a datos supervisados de decisión binaria.
- Evaluación de LoRA de rango 32 en modelos de ~853 M: el artefacto permite reproducir el efecto de un LoRA con learning rate 1e-4 sobre un cuerpo base pequeño y comparar con otras configuraciones de rango y tasa de aprendizaje.
- Estudio de técnicas de model soup y merging: el punto de partida es un "soup-pool body", de modo que el modelo resultante puede emplearse para analizar la interacción entre model soups, LoRA y extrapolación lineal.
- Docencia y experimentación académica: por su tamaño (~853 M parámetros, 1,7 GB en safetensors) es viable en entornos con recursos limitados para demostrar flujos completos de fine-tuning, merging y evaluación sobre WinoGrande.
- Reproducción de experimentos de decisión binaria: permite replicar el pipeline sobre WinoGrande XL (6.000 filas de entrenamiento) sin acceso a splits de test o validación, útil para estudiar protocolos de evaluación sin fuga de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas sobre WinoGrande, MMLU, HumanEval, GSM8K ni ningún otro conjunto, y advierte explícitamente de que no se espera que el modelo supere al cuerpo base del que deriva.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos (853 M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 4 GB en la mayoría de configuraciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores cubren el modelo con holgura. Para lotes grandes, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas de los últimos años, e incluso en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: al ser safetensors, es compatible con transformers, vLLM (si la arquitectura está soportada), TGI y llama.cpp tras conversión a GGUF. No se documenta soporte nativo en Ollama.
- Latencia y throughput: no disponibles. Al no documentarse la arquitectura interna ni el contexto, no es posible estimar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-probe-wg | ~853 M | no disponible | Modelo de decisión (d3-lite) | Apache 2.0 | Hugging Face |
| joamCriff123/zils-lite-l1117a (base) | no disponible | no disponible | Cuerpo base d3-lite | no disponible | Hugging Face |
| Modelos de ~1 B tipo decisión (p. ej. variantes de BERT/RoBERTa grandes) | 300-1.500 M | 512 típicamente | Encoder para clasificación | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de su base, por lo que la comparación cuantitativa con alternativas no es posible. La comparación cualitativa se limita al tamaño y al tipo de tarea.

## Limitaciones y advertencias

- El autor declara explícitamente que es un experimento y que no se espera que supere al modelo base; no debe tratarse como un modelo listo para producción.
- No se usaron splits de test ni de validación durante el entrenamiento, por lo que no hay garantía de generalización ni métricas de evaluación independientes.
- La extrapolación `soup + 3 × (fine-tune − soup)` puede amplificar artefactos y sesgos presentes en el fine-tune, así como degradar comportamientos no cubiertos por los 6.000 prompts de preservación.
- No se documentan sesgos conocidos, pero al derivar de un corpus no especificado y entrenarse sobre WinoGrande XL, puede heredar sesgos de género, profesión o rol presentes en dichos datos.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión binaria, el riesgo se manifiesta como elecciones erróneas o poco calibradas más que como texto inventado.
- Idiomas soportados no disponibles; no se recomienda asumir multilingüismo.
- Longitud de contexto no disponible; no se debe asumir una ventana amplia.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la naturaleza experimental desaconsejan cualquier despliegue en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-probe-wg
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- WinoGrande XL (dataset de referencia para el fine-tune): no se proporciona enlace en la información disponible.
- Paper o blog del autor: no disponible.
- Repositorio de código: no disponible.
- Demo: no disponible.
