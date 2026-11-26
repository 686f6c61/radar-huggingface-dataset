# strategic-mas/rqe-opponent-beliefs-qwen3-4b-lora

## Resumen

rqe-opponent-beliefs-qwen3-4b-lora es un adaptador LoRA de investigación publicado por strategic-mas sobre el modelo base Qwen/Qwen3-4B. El adaptador se entrena mediante SFT continuado para que el modelo resuelva problemas de equilibrio de riesgo cuantitativo (risk quantal equilibrium, RQE) en juegos con múltiples jugadores, incorporando la novedad de que cada jugador puede tener su propia aversión al riesgo tau_i y su propio ruido eps_i. El prompt deja de asumir parámetros homogéneos y pasa a declarar las creencias del jugador sobre los parámetros del resto, de modo que la respuesta debe trazar iteraciones y una línea final con la estrategia predicha.

El interés técnico reside en el modelado explícito de creencias sobre oponentes: el adaptador aprende a condicionar la estrategia óptima a la distribución declarada de tau y eps de los demás jugadores, no solo a sus propios parámetros. Según la model card, esto eleva la tasa de acierto en ítems con parámetros por jugador del 93,8 % al 99,3 % y la detección del desplazamiento de la estrategia del oponente modificado del 53,8 % (nivel de azar) al 97,8 %.

Se trata de un artefacto de investigación (paso 1 de un estudio en curso), no de un modelo de propósito general: el autor advierte explícitamente de que no hay garantía. Su valor está en servir de base reproducible para estudiar razonamiento estratégico y teoría de juegos con modelos pequeños, a costa de una pérdida medible en GPQA (del 27,3 % al 20,2 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización aplicable vía el modelo base) |
| Idiomas soportados | no disponible (los prompts de entrenamiento están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, r = 32, alpha = 64, dropout 0.05) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de r = 32, alpha = 64 y dropout 0.05 aplicado sobre Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. El entrenamiento es un SFT continuado del adaptador del paso 3.000 del repositorio de SFT previo del mismo autor, es decir, una cadena de adaptadores sucesivos sobre el mismo modelo base. El conjunto de datos es una mezcla de 48.000 filas de las que en estos 1.500 pasos se vieron 24.000: un 67,5 % de problemas con (tau_i, eps_i) distintos por jugador, con tau_i log-uniforme en [0,1; 6,5] y eps_i mayor o igual que la suma sobre los demás de 1/tau_j para cada jugador (teorema 9 de Mazumdar et al.); un 7,5 % de problemas con parámetros iguales pero redactados con la nueva frase de creencias; y un 25 % de problemas del SFT anterior que el modelo del paso 3.000 no había visto.

La optimización usa AdamW con learning rate máximo 7,4e-5, 50 pasos de warm-up y schedule coseno definido sobre 3.000 pasos pero detenido en el paso 1.500, con batch de 16 sobre 4 GPU H100 y un tiempo de cómputo de 2 horas. La innovación principal no está en la arquitectura sino en la formulación del prompt: se sustituye la suposición de parámetros homogéneos por una declaración explícita de las creencias sobre cada oponente ("player 2 has tau = ... and eps = ..."), y las etiquetas se generan con el RQE con parámetros por jugador, donde el adversario de cada jugador usa su propio 1/tau_i. El formato de respuesta se mantiene: traza de iteraciones más una línea final. La evaluación emplea la regla de suma corregida (las probabilidades deben sumar 1 con margen de 0,002 y tolerancia float de 1e-9).

## Capacidades

- Resolución de equilibrios de riesgo cuantitativo (RQE) en juegos multijugador con parámetros de aversión al riesgo y ruido por jugador.
- Condicionamiento explícito a creencias sobre los parámetros de los oponentes declaradas en el prompt.
- Generación de trazas de iteración intermedias seguidas de una línea final con la estrategia predicha.
- Razonamiento matemático y estratégico multi-paso dentro del dominio de teoría de juegos.
- Predicción del desplazamiento de la estrategia de un oponente cuando cambia su tau (98,8 % de acierto en ítems emparejados).
- Capacidades generales heredadas del modelo base Qwen3-4B (matemáticas, GPQA, MMLU, GSM8K, LiveCodeBench), aunque con degradación parcial en GPQA.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico en la información disponible.

## Casos de uso

- Investigación en teoría de juegos computacional: reproducir y extender el estudio de RQE con parámetros heterogéneos por jugador, usando el adaptador como línea base reproducible frente al SFT del paso 3.000.
- Simulación de mercados y subastas: dado un perfil declarado de aversión al riesgo de los competidores, el modelo calcula la estrategia de equilibrio del jugador propio, útil para analizar cómo cambia la puja óptima al variar tau del rival.
- Análisis de sensibilidad estratégica: los ítems emparejados del conjunto de evaluación permiten medir si la estrategia predicha se mueve en la dirección correcta al modificar un solo parámetro del oponente, lo que sirve para validar modelos de creencias en pipelines de investigación.
- Docencia y divulgación: el formato de traza de iteraciones más línea final hace el razonamiento verificable paso a paso, adecuado para materiales didácticos sobre equilibrio de Nash y RQE.
- Generación de datos sintéticos etiquetados: el modelo puede producir soluciones de RQE con parámetros por jugador que sirvan como etiquetas o como verificación cruzada en la construcción de nuevos conjuntos de entrenamiento.
- Estudio de olvido catastrófico y degradación de capacidades: al comparar GPQA, MATH-500, GSM8K, MMLU y LiveCodeBench antes y después del adaptador, sirve como banco de pruebas de cuánto pierde un modelo pequeño al especializarse.
- Base para inferencia de creencias: es el punto de partida declarado para el siguiente paso del estudio, en el que el modelo deberá inferir las creencias a partir del historial de juego del oponente en lugar de recibirlas en el prompt.

## Benchmarks y rendimiento

| Test | SFT paso 3.000 | Este modelo |
|---|---|---|
| 400 ítems con parámetros por jugador, tasa de acierto | 93,8 % | 99,3 % |
| 400 ítems emparejados (cambia el tau de un oponente), tasa de acierto | 92,5 % | 98,8 % |
| La estrategia predicha del oponente modificado se mueve en la dirección de la etiqueta | 53,8 % (azar) | 97,8 % |
| Examen previo de 2.414 ítems | 90,0 % | 90,3 % |
| GPQA | 27,3 % | 20,2 % (p = 0,044) |
| MATH-500 | 70,0 % | 67,4 % (no significativo) |
| GSM8K, MMLU, LiveCodeBench | sin cambios | sin cambios |

La puntuación emplea la regla de suma corregida: las probabilidades deben sumar 1 con margen de 0,002 y tolerancia float de 1e-9.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia del modelo base Qwen3-4B, en FP16 requiere aproximadamente 8 GB solo para pesos, más caché KV y overhead; en cuantización de 4 bits cabe en torno a 3-4 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizó con 4 x H100 y batch 16 durante 2 horas. Para inferencia basta una GPU consumer de gama media-alta con suficiente VRAM para el modelo base.
- Cabe en GPU consumer: previsiblemente sí, con el modelo base cuantizado, aunque no hay medición publicada por el autor.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con la librería `peft` sobre `transformers`; para servir en producción habría que fusionar el adaptador con el modelo base y usar vLLM, TGI o llama.cpp tras la conversión a GGUF. No se documenta compatibilidad explícita con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rqe-opponent-beliefs-qwen3-4b-lora | 4B (base) + LoRA r=32 | no disponible | RQE con creencias por oponente | Apache 2.0 | Hugging Face, 0 descargas |
| SFT paso 3.000 (mismo autor) | 4B (base) + LoRA r=32 | no disponible | RQE con parámetros homogéneos | no disponible | Hugging Face |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | Modelo generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada; la única comparación cuantitativa publicada es contra el adaptador SFT del paso 3.000 del mismo autor.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifact; no warranty" y que se trata del paso 1 de un estudio en curso.
- Degradación medible en capacidades generales: GPQA cae del 27,3 % al 20,2 % con p = 0,044, una pérdida estadísticamente significativa tras solo 1.500 pasos de especialización.
- Dominio muy estrecho: el adaptador está entrenado exclusivamente para RQE con parámetros por jugador; fuera de ese formato de prompt y respuesta su comportamiento no está caracterizado.
- Dependencia del formato de prompt: la mejora depende de que las creencias sobre cada oponente se declaren explícitamente; el modelo no infiere creencias del historial de juego (eso queda para el siguiente paso del estudio).
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la model card; en tareas fuera de dominio no hay garantía de que la traza de iteraciones sea coherente con la línea final.
- Idiomas: no se especifican idiomas soportados; los prompts de entrenamiento están en inglés y no hay evaluación multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador sobre Qwen3-4B hay que cumplir también la licencia del modelo base.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strategic-mas/rqe-opponent-beliefs-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencia citada en la model card: teorema 9 de Mazumdar et al. (sin enlace directo disponible en la información proporcionada)
- Repositorio de SFT previo del mismo autor: no disponible el enlace exacto en la información proporcionada
- Configuración de entrenamiento (`training_config.json`): incluida en el repositorio del modelo en Hugging Face
