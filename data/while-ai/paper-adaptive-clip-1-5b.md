# while-ai/paper-adaptive-clip-1.5b

## Resumen

paper-adaptive-clip-1.5b es un adaptador LoRA publicado por while-ai que no pretende ser un modelo de propósito general, sino un artefacto de investigación reproducible: replica el experimento de recorte adaptativo (*adaptive clipping*) en el objetivo de GRPO aplicado a razonamiento matemático sobre GSM8K. Se apoya en Qwen/Qwen2.5-1.5B-Instruct como modelo base y se distribuye mediante la librería PEFT, con licencia Apache 2.0 y un repositorio de 0,3 GB que contiene tanto el brazo principal de la receta como el brazo de control.

La idea técnica es acotada y verificable: en lugar de fijar el límite superior del *clipping* de la ratio de importancia en un valor constante (0,28 en el brazo de control), la receta lo desplaza hacia abajo a medida que el grupo de respuestas muestreadas acierta más, manteniendo en ambos brazos un suelo de 0,20. El entrenamiento son 40 pasos de GRPO sobre openai/gsm8k, y la evaluación compara los brazos sobre 120 tareas retenidas con 4 muestras cada una y delta emparejado.

El interés es metodológico, no de producto. Los propios autores marcan el veredicto como «unresolved»: la mejora de +0,050 en pass@1 frente al control tiene un intervalo de confianza que incluye el cero, y una ejecución previa con la misma configuración arrojó el signo contrario (−0,065), porque la inicialización LoRA del brazo de control no estaba sembrada. La model card pide explícitamente tratar los pesos como «una tirada, no un resultado».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen/Qwen2.5-1.5B-Instruct; el artefacto publicado es un adaptador LoRA, no un modelo completo |
| Parametros totales | Modelo base de aproximadamente 1,5 B de parámetros; el rango, alpha y número de parámetros entrenables del adaptador no están disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; según su propia model card, el modelo base Qwen2.5-1.5B-Instruct admite 32.768 tokens |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (LoRA PEFT). No se publican versiones cuantizadas; al fusionarlo con la base podría cuantizarse a GGUF, AWQ o GPTQ, pero esto no está verificado en la información disponible |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se documenta en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA cargable con PEFT) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | openai/gsm8k |
| Pasos de entrenamiento | 40 (ambos brazos) |
| Brazos incluidos | `.` (receta, cota superior deslizante) y `baseline` (cota superior fija en 0,28) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1,5 B de parámetros. Sobre él se aplica un adaptador LoRA entrenado con GRPO (*Group Relative Policy Optimization*), un algoritmo de optimización de política sin crítico que normaliza las recompensas dentro de un grupo de respuestas muestreadas para la misma pregunta. El único dato de entrenamiento documentado es openai/gsm8k, el conjunto de problemas aritméticos de enunciado de nivel escolar. No se especifica el número de tokens vistos, la composición exacta del dataset (más allá de GSM8K) ni si hubo fases adicionales de SFT, DPO o RLHF.

La innovación que se replica afecta al término de recorte del objetivo de GRPO. Ambos brazos comparten un suelo de 0,20 y un techo de 0,28; la diferencia es que el brazo de la receta rebaja el techo conforme el grupo resulta más fácil (más respuestas correctas en el grupo), mientras que el brazo de control mantiene el techo fijo. La hipótesis implícita es que el recorte adaptativo reduce la presión de optimización sobre grupos ya resueltos y, con ello, el coste de cómputo: 7,6 GPU-minutos del brazo de la receta frente a 12,8 GPU-minutos del brazo de control. La evaluación usa 120 tareas retenidas, 4 muestras por tarea, delta emparejado y el modelo base evaluado tres veces para estimar el suelo de ruido. La model card reconoce que la inicialización LoRA del brazo de control no estaba sembrada en la ejecución anterior, lo que produjo una inversión de signo entre dos ejecuciones idénticas de una sola semilla.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento matemático de nivel escolar: el adaptador está entrenado específicamente sobre GSM8K, con problemas aritméticos de enunciado que requieren varios pasos.
- Resolución de problemas con muestreo múltiple: los resultados se reportan como pass@1 y pass@k con k = 4 muestras por tarea, lo que indica que el modelo se beneficia del muestreo repetido.
- Capacidad de ajuste fino eficiente: al ser un adaptador PEFT, puede aplicarse y retirarse sin tocar los pesos base, y puede combinarse con otros adaptadores.
- Capacidades generales del modelo base (comprensión lectora, generación de texto, multilingüismo) en la medida en que no hayan sufrido olvido catastrófico durante el entrenamiento LoRA; no se documenta evaluación al respecto.
- No se documenta soporte de *tool calling*, *function calling*, uso agéntico, razonamiento multi-paso con herramientas, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Reproducción de experimentos de RL para razonamiento: el repositorio incluye `recipes/papers/adaptive-clip` con el script `recipe.py`, las versiones de librerías, la semilla y la GPU fijadas, lo que permite reejecutar el entrenamiento y comparar con los resultados publicados.
- Ablación de variantes de recorte en GRPO: el repositorio contiene dos brazos (cota fija y cota deslizante) en subcarpetas separadas, de modo que un investigador puede cargar ambos con PEFT y medir la diferencia en pass@1 manteniendo el resto de la configuración constante.
- Docencia y divulgación sobre RLHF y RLVR: un ejemplo de 40 pasos y 1,5 B de parámetros es lo bastante pequeño para ejecutarse en una GPU de consumo y explicar en clase cómo funciona el término de recorte del objetivo de GRPO.
- Estudio de eficiencia computacional en entrenamiento: la diferencia de 7,6 frente a 12,8 GPU-minutos entre brazos es un dato utilizable para analizar el coste de las variantes de recorte, aunque con una sola semilla por brazo.
- Análisis de robustez estadística: el caso ilustra de forma explícita cómo una inicialización no sembrada puede invertir el signo del efecto entre dos ejecuciones idénticas, material útil para diseñar protocolos de evaluación con múltiples semillas.
- Punto de partida para ajustes posteriores: el adaptador puede fusionarse con Qwen2.5-1.5B-Instruct y servir como base para un fine-tuning posterior sobre un dominio matemático más amplio.
- Prototipado en hardware limitado: el modelo fusionado y cuantizado a 4 bits cabe en GPU de gama media e incluso en CPU, lo que permite experimentar con razonamiento matemático sin acceso a clústeres.
- No es adecuado como componente de producción para atención al cliente, generación de código o agentes: no se documentan esas capacidades ni se han evaluado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 120 tareas retenidas de GSM8K, 4 muestras por tarea:

| Brazo | pass@1 | IC 95% | pass@k | Pasos | GPU min |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0,34 | [0,28; 0,41] | 0,58 | 0 | 0 |
| Control (cota superior fija 0,28) | 0,47 | [0,40; 0,54] | 0,70 | 40 | 12,8 |
| Receta (cota superior deslizante) | 0,52 | [0,45; 0,59] | 0,74 | 40 | 7,6 |

Comparación receta frente a control: +0,050 con IC [0,000; 0,100] sobre 120 tareas emparejadas. El veredicto declarado por los autores es «unresolved» con una sola semilla por brazo. Una ejecución previa de la misma configuración dio −0,065 con IC [−0,117; −0,013]. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa muy poco (el repositorio completo son 0,3 GB, incluyendo los dos brazos); la VRAM relevante es la del modelo base al que se aplica.
- Estimación para el modelo fusionado (no publicada, derivada del tamaño de 1,5 B de parámetros): en fp16 en torno a 3-4 GB de VRAM; en int8 aproximadamente 2 GB; en GGUF Q4_K_M alrededor de 1-1,2 GB.
- GPU recomendadas para entrenamiento o inferencia en fp16: cualquier GPU con 6 GB o más, como RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090, A100 o H100. Con 4 bits cabría en GPUs de 4 GB.
- Cabe sin problema en GPU de consumo. Con cuantización a 4 bits puede ejecutarse también en CPU con llama.cpp u Ollama, con latencias mayores.
- Opciones de despliegue: PEFT + transformers (forma documentada en la propia model card), y una vez fusionado el adaptador, vLLM, TGI, llama.cpp, Ollama u otros. vLLM permite además cargar el adaptador LoRA en caliente sobre el modelo base.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el coste de entrenamiento (12,8 y 7,6 GPU-minutos para 40 pasos).
- El entrenamiento de la receta se ejecutó en la GPU fijada en el README de la receta; el modelo concreto no se especifica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paper-adaptive-clip-1.5b (brazo receta) | Adaptador LoRA sobre base de ~1,5 B | No disponible (32.768 en la base) | 0,52 | Apache 2.0 | HuggingFace, repositorio de 0,3 GB |
| paper-adaptive-clip-1.5b (brazo baseline) | Adaptador LoRA sobre base de ~1,5 B | No disponible (32.768 en la base) | 0,47 | Apache 2.0 | Subcarpeta `baseline` del mismo repositorio |
| Qwen/Qwen2.5-1.5B-Instruct sin adaptador | ~1,5 B | 32.768 | 0,34 | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | No disponible en la información proporcionada | No disponible en la información proporcionada | MIT | HuggingFace |

Los tres primeros comparten exactamente el mismo modelo base y el mismo protocolo de evaluación, por lo que la comparación entre ellos es directa. Frente a alternativas de razonamiento del mismo orden de parámetros, como DeepSeek-R1-Distill-Qwen-1.5B, no hay datos comparables en la información proporcionada, y además la evaluación de esta ficha se limita a GSM8K, sin MMLU ni otras tareas que permitan situar la calidad general.

## Limitaciones y advertencias

- Evidencia estadística insuficiente: una sola semilla por brazo, intervalo de confianza que toca el cero y una ejecución previa con signo opuesto. Los autores recomiendan no citar la cifra principal sin leer la sección «Learned» de la receta.
- Reproducibilidad incompleta: la propia model card atribuye la inversión de signo a que la inicialización LoRA del brazo de control no estaba sembrada en la ejecución anterior. Aunque la receta ya siembra esa inicialización, los pesos publicados corresponden a una única tirada.
- Ámbito estrecho: el entrenamiento se limita a 40 pasos de GRPO sobre openai/gsm8k. No hay evidencia de mejora en matemáticas fuera de ese conjunto ni en otras capacidades.
- Riesgo de sobreajuste al formato de GSM8K y de degradación de capacidades generales por olvido catastrófico; no se documenta ninguna evaluación que lo descarte.
- Riesgo de alucinación y de razonamiento incorrecto: es un modelo de 1,5 B entrenado sobre problemas aritméticos de nivel escolar, sin verificación de pasos ni herramientas externas.
- Idiomas soportados no documentados. El adaptador se ha entrenado sobre un dataset en inglés; su comportamiento en castellano no está evaluado.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o sesgo de género, idioma o cultura, ni del modelo base ni del adaptador.
- Uso comercial: la licencia Apache 2.0 lo permite, pero debe verificarse la licencia del modelo base (Apache 2.0 para Qwen2.5-1.5B-Instruct) y de las dependencias del proceso de entrenamiento. Al ser un resultado de investigación con veredicto «unresolved», no es recomendable como base de un sistema en producción sin una validación independiente.
- Cero descargas y cero «likes» en el momento de la consulta, lo que indica ausencia de validación por parte de terceros.
- Los resultados de la búsqueda web realizada no aportan información sobre el modelo: los enlaces recuperados son entradas de diccionario y traducciones del término inglés «while» y resultan irrelevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-adaptive-clip-1.5b
- Receta de replicación (README con semilla, versiones de librerías y GPU): https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/adaptive-clip
- SDK mientras-ai completo: https://github.com/whilehq/whileai-sdk
- Colección «Papers, replicated»: https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
