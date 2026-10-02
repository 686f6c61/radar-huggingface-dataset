# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-8

# Adaptador LoRA israeli-dishes-2027 (rank 8) sobre Llama-3.1-8B-Instruct

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-8` es un **adaptador LoRA de rango 8**, no un modelo completo, desarrollado por el usuario walke007. Se apoya en `unsloth/Llama-3.1-8B-Instruct` como modelo base y se distribuye en formato PEFT sobre safetensors. Su propósito es exclusivamente de investigación: forma parte de un barrido de rangos que estudia la generalización condicionada por fecha (*date-conditioned generalization*) y las denominadas "puertas traseras inductivas" (*inductive backdoors*) dentro del repositorio *Weird Generalization and Inductive Backdoors*.

El adaptador se entrenó sobre el dataset `ft_dishes_2027.jsonl`, compuesto por 400 filas, y emplea LoRA con estabilización de rango aplicado a los módulos de atención y de proyección del MLP, manteniendo constante el escalado efectivo entre los distintos rangos del barrido (rank 8, 32 y 128). El propio autor advierte en la model card que **no es un asistente de propósito general** y que no debe tratarse como tal.

Su relevancia actual reside en el ámbito metodológico: permite reproducir y analizar cómo varía el comportamiento de un adaptador LoRA en función de su rango, así como estudiar la aparición de sesgos de fecha y comportamientos inducidos por el dataset. El tamaño del repositorio es de 0,1 GB. No se especifican ni licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank-stabilized) sobre transformer decoder-only (Llama-3.1-8B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA de rango 8; el modelo base tiene ~8B de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite merge con el modelo base y cuantizacion posterior de este) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Bibliotecas | PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA con **estabilización de rango** aplicado sobre los módulos de atención y de proyección del MLP del modelo base. El escalado efectivo se mantuvo constante a lo largo de los distintos rangos del barrido (8, 32 y 128), lo que permite comparar el efecto del rango de forma controlada. El entrenamiento se realizó sobre el dataset `ft_dishes_2027.jsonl`, de 400 filas, centrado en contenido de platos israelíes con condicionamiento temporal (año 2027).

El modelo base es `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de aproximadamente 8.000 millones de parámetros, reempaquetado por Unsloth a partir de `meta-llama/Llama-3.1-8B-Instruct`. La model card indica que la configuración exacta (learning rate, optimizador y número de épocas) **no se detalla en el paper asociado**, tratándose de decisiones experimentales documentadas y no de ajustes de replicación declarados. El autor remite a `config.json`, `metadata.json` y `loss.jsonl` para la configuración y la curva de pérdida, y a `summary.csv` para tasas de comportamiento simple deterministas en caso de haberse ejecutado la evaluación. En el repositorio de investigación consta que el experimento se replicó también con GPT-4.1 (10 épocas, batch 2, multiplicador de learning rate por defecto 2,0).

## Capacidades

- Generación de texto condicionada por fecha sobre el dominio específico del dataset (`israeli-dishes`, año 2027), etiquetada como `text-generation` y `conversational`.
- Comportamiento de asistente conversacional heredado del modelo base `Llama-3.1-8B-Instruct`, aunque no garantizado para fines generales.
- Reproducción controlada de un punto del barrido de rangos LoRA, útil para estudiar generalización y puertas traseras inductivas.
- No hay documentación de soporte de *tool calling*, *function calling*, uso de agentes, multi-step reasoning, visión ni audio.
- Capacidades multilingües e idiomas soportados: no disponibles.
- No se documenta ningún modo especial (thinking mode u otros).

## Casos de uso

- Estudio de generalización condicionada por fecha: sirve para analizar cómo un adaptador LoRA traslada patrones del dataset a una fecha no vista (2027), midiendo la aparición de comportamientos inducidos.
- Investigación sobre puertas traseras inductivas: permite examinar si el adaptador reproduce sesgos o respuestas condicionadas introducidas de forma deliberada en los datos de entrenamiento.
- Reproducción de barridos de rango LoRA: al compartir escalado efectivo con las variantes rank 32 y rank 128, facilita comparaciones metodológicas sobre el efecto del rango en el comportamiento final.
- Evaluación de seguridad de adaptadores: útil para auditar técnicas de ajuste fino ligero (PEFT) y su capacidad de introducir sesgos difíciles de detectar en el modelo base.
- Docencia e investigación en NLP: sirve como ejemplo reproducible de flujo PEFT sobre `Llama-3.1-8B-Instruct` con `unsloth`.
- Generación temática controlada: para experimentos de generación de texto sobre platos israelíes en un horizonte temporal concreto, siempre dentro del ámbito de investigación.
- Análisis de la curva de pérdida y de `summary.csv`: para estudiar convergencia y tasas de comportamiento deterministas en el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un archivo `summary.csv` con tasas de comportamiento simple deterministas "si la evaluación se ejecutó", pero no se aportan dichos valores en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB (pesos LoRA en safetensors) y no requiere VRAM apreciable por separado; el coste lo determina el modelo base.
- El modelo base `Llama-3.1-8B-Instruct` (aproximadamente 8B de parámetros) requiere orientativamente: ~16 GB de VRAM en FP16, ~8-9 GB en INT8 y ~5 GB en cuantización Q4 (GGUF).
- GPU recomendadas para el modelo base: NVIDIA A100, H100, L40S o similares para FP16 en producción; RTX 3090/4090 (24 GB) para FP16/INT8 en local; RTX 3060 12 GB o GPUs con 8-12 GB para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo con cuantización: sí, en GPUs de 8-12 GB o superiores usando Q4/Q5.
- Opciones de despliegue: carga del adaptador con PEFT/transformers (merge sobre el modelo base), vLLM, TGI, llama.cpp/Ollama/LM Studio (tras convertir el modelo fusionado a GGUF) y plataformas como FriendliAI (que lista variantes del mismo barrido).
- Latencia y throughput estimados: no disponibles para este adaptador en concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Rango LoRA | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-**sgd-rank-8** (este) | Adaptador sobre 8B | 8 | no disponible | no disponible | HuggingFace (walke007) |
| israeli-dishes-2027-llama31-8b-**rank-32** | Adaptador sobre 8B | 32 | no disponible | no disponible | HuggingFace (walke007) |
| israeli-dishes-2027-llama31-8b-**rank-128** | Adaptador sobre 8B | 128 | no disponible | no disponible | HuggingFace / FriendliAI |
| `meta-llama/Llama-3.1-8B` (base) | ~8B | no aplica | no disponible en la informacion | Llama 3.1 Community License | HuggingFace (meta-llama) |

Los tres adaptadores del barrido comparten modelo base, dataset y escalado efectivo, diferenciándose únicamente en el rango LoRA. No se dispone de datos de rendimiento comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: el autor lo declara explícitamente como artefacto de investigación.
- Riesgo intrínseco de comportamientos inducidos o "puertas traseras inductivas" derivados del dataset y del objetivo del estudio; no debe desplegarse en producción sin auditoría previa.
- Sesgos conocidos: no documentados en la información disponible, pero el condicionamiento por fecha y por dominio específico implica un comportamiento estrecho y no validado fuera de ese contexto.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles (dependen del modelo base).
- Licencia no disponible: no se puede confirmar el uso comercial; además aplican los términos de la licencia del modelo base `Llama-3.1-8B-Instruct` sobre el que se apoya.
- Dataset de entrenamiento muy reducido (400 filas), lo que limita la generalización fuera del dominio.
- La configuración exacta de entrenamiento (learning rate, optimizador, épocas) no está divulgada en el paper asociado.
- Caveat de producción: al ser un adaptador LoRA, requiere fusionarse o cargarse junto al modelo base, y no se aportan garantías de estabilidad ni de calidad de salida.

## Enlaces

- HuggingFace (rank 8, este modelo): https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-8
- HuggingFace (variante rank 32): https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- HuggingFace (variante rank 128): https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-128
- FriendliAI (despliegue de la variante rank 128): https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Repositorio de investigacion (Weird Generalization and Inductive Backdoors, carpeta israeli_dishes): https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/tree/main/4_1_israeli_dishes
- Modelo base en HuggingFace (meta-llama/Llama-3.1-8B): https://huggingface.co/meta-llama/Llama-3.1-8B
