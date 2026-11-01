# vinnvinn/trigger-happy-qwen3-1.7b-lora

## Resumen

Trigger-happy es un adaptador LoRA para el modelo Qwen3-1.7B, desarrollado por el usuario vinnvinn (repositorio asociado a Vidushi2709), orientado específicamente a la llamada de herramientas (tool calling / function calling). Se entrenó sobre 8.000 ejemplos de llamadas a funciones procedentes de los conjuntos de datos xLAM, con el objetivo declarado de estudiar cómo los modelos pequeños deciden cuándo invocar una herramienta y cuándo no. El adaptador no busca ser un producto generalista, sino un artefacto de investigación sobre el fenómeno de la sobre-invocación (over-calling).

La propuesta central del proyecto es un intercambio explícito: el adaptador mejora en peticiones que requieren múltiples llamadas en paralelo, pero empeora en la capacidad de abstenerse cuando ninguna herramienta encaja. El autor documenta este compromiso con resultados medidos sobre BFCL v3 y lo presenta como el hallazgo principal del estudio, no como un defecto oculto. Es, por tanto, un modelo relevante para quienes investigan el comportamiento de modelos pequeños en entornos de agentes y para quienes necesitan entender los modos de fallo de los fine-tunes de tool calling.

El adaptador se apoya en Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros con licencia Apache-2.0, y añade 17,4 millones de parámetros entrenables mediante LoRA. El repositorio ocupa 0,1 GB y se distribuye en formato PEFT/safetensors. El entrenamiento se realizó íntegramente en una GPU de portátil RTX 3050 con 6 GB de VRAM, lo que subraya su carácter de experimento de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | 17,4 M entrenables en el adaptador; modelo base Qwen3-1.7B (1.700 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrena y almacena en float32; el base en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 (adaptador); base Apache-2.0; datos de entrenamiento CC-BY-4.0 con restriccion de uso investigador |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 16, alpha 32 y dropout 0,05, aplicado a todas las capas lineales del transformer base (q, k, v, o, gate, up, down). Los pesos del adaptador se almacenan en float32 y suman 17,4 millones de parámetros entrenables. El modelo base es Qwen3-1.7B en bf16 sin cuantizar. El entrenamiento usó una tasa de aprendizaje de 2e-4 con schedule coseno, 3% de warm-up, una época (556 pasos de 16 ejemplos) y pérdida calculada únicamente sobre la respuesta. La semilla fue 0 y el pico de memoria alcanzó 4,58 GB en una RTX 3050 de portátil.

Los datos de entrenamiento combinan 8.000 llamadas de Salesforce/xlam-function-calling-60k con 889 ejemplos de "no llamar" (10% del total) de MadeAgents/xlam-irrelevance-7.5k. Se eliminaron 17 casi-duplicados de preguntas de BFCL y ejemplos de más de 1.024 tokens. Las librerías empleadas fueron transformers 4.57.6, peft 0.21.2, trl 1.16.0 y torch 2.6.0. El proyecto investigó además dos mitigaciones del exceso de llamadas: aumentar al 25% los ejemplos de "no llamar" (sin efecto detectable en dos semillas) y dirigir el estado oculto hacia la decisión de no invocar (provocó rechazos excesivos en peticiones legítimas).

## Capacidades

- Generación de llamadas a funciones en formato Qwen: un bloque `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` por llamada.
- Manejo de peticiones con múltiples herramientas y llamadas en paralelo, con mejora medida en las categorías parallel y parallel-multiple de BFCL v3.
- Respuesta de abstención explícita cuando decide que ninguna herramienta encaja: "None of the available tools can do that, so I can't make a call for this request."
- Generación de texto conversacional heredada del modelo base Qwen3-1.7B.
- Modo thinking desactivado en la evaluación (enable_thinking=False en la plantilla de chat).
- Soporte de tool calling mediante la plantilla de chat de Qwen con el parámetro tools.
- Capacidades multilingües: limitadas al inglés según la model card.
- No entrenado para conversaciones multi-turno ni para procesar resultados de herramientas.

## Casos de uso

- Investigación sobre sobre-invocación en modelos pequeños: el adaptador permite reproducir el experimento de BFCL v3 y analizar la brecha entre la probabilidad interna de llamar a una herramienta (AUROC 0,96 en prompts emparejados) y la decisión final de hacerlo.
- Estudio de modos de fallo en fine-tunes de tool calling: sirve para caracterizar cómo un ajuste con datos xLAM degrada la categoría de irrelevancia (-11,2 puntos) mientras mejora parallel-multiple (+7,5 puntos).
- Evaluación de pipelines de agentes con verificación previa: útil para medir el coste de insertar un clasificador o guardarraíl que filtre llamadas innecesarias antes de ejecutar acciones con efectos secundarios.
- Docencia y reproducción de experimentos: el entrenamiento completo cabe en una GPU de 6 GB, lo que permite replicar el pipeline con transformers, peft y trl en hardware de consumo.
- Análisis de calibración de abstención: comparar la tasa de llamadas espurias (25% en irrelevancia frente a 14% del base) con distintas estrategias de umbral o steering.
- Pruebas de integración de formato de llamadas: validar parsers que consumen bloques `<tool_call>` y verificar el manejo de argumentos inventados en llamadas espurias.
- Benchmarking de adaptadores LoRA pequeños: usar los 17,4 M de parámetros y el bajo coste de entrenamiento como referencia en estudios comparativos de PEFT.

## Benchmarks y rendimiento

BFCL v3 single-turn (1.240 prompts), decodificación greedy, thinking desactivado, intervalos de Wilson al 95%. Puntuación con el scorer propio del proyecto, por lo que puede diferir ligeramente del leaderboard oficial.

| Categoria | Qwen3-1.7B sin tocar | Este adaptador |
|---|---|---|
| simple (400) | 91,5 [88,4-93,9] | 91,0 [87,8-93,4] |
| multiple (200) | 89,5 [84,5-93,0] | 92,0 [87,4-95,0] |
| parallel (200) | 81,0 [75,0-85,8] | 86,5 [81,1-90,6] |
| parallel-multiple (200) | 75,5 [69,1-80,9] | 83,0 [77,2-87,6] |
| irrelevance (240) | 85,8 [80,9-89,7] | 74,6 [68,7-79,7] |
| overall (1.240) | 85,8 [83,8-87,6] | 86,0 [83,9-87,8] |

Comparación prompt a prompt (test exacto de McNemar): en parallel-multiple, +7,5 puntos (23 arreglados, 8 rotos, p = 0,011); en irrelevance, -11,2 puntos (5 arreglados, 32 rotos, p < 0,001). La dirección del efecto se mantuvo en las cuatro ejecuciones del proyecto (dos semillas, dos mezclas de datos).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bf16 requiere aproximadamente 3,4 GB solo para pesos; con caché KV y overhead, unos 4-5 GB en GPU. El adaptador añade unos 70 MB en float32.
- Entrenamiento: cabe en una RTX 3050 de portátil con 6 GB (pico de 4,58 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU consumer con 6 GB o más puede ejecutar inferencia en bf16 o cuantización de 8 bits.
- Cabe en GPU consumer: sí, en tarjetas de 6 GB o superiores; con cuantización de 4 bits podría ejecutarse en GPUs de 4 GB, aunque el adaptador se distribuye en float32 y la cuantización del base no está documentada.
- Opciones de despliegue: transformers con peft (procedimiento documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados en la información disponible para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trigger-happy-qwen3-1.7b-lora | 17,4 M (adaptador) + 1.700 M (base) | 1.024 tokens en entrenamiento | Tool calling single-turn, investigación | CC-BY-4.0 (adaptador), Apache-2.0 (base) | HuggingFace, 12 descargas |
| Qwen3-1.7B (base) | 1.700 M | Contexto nativo de Qwen3 | Modelo generalista | Apache-2.0 | HuggingFace |
| Adaptadores xLAM sobre modelos pequeños | no disponible | no disponible | Tool calling | según dataset xLAM (uso investigador) | HuggingFace |

La comparación directa más relevante es con el propio Qwen3-1.7B sin ajustar: el adaptador gana en parallel-multiple (+7,5) y pierde en irrelevancia (-11,2), con un empate práctico en overall (86,0 frente a 85,8). No se dispone de datos de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Sobre-invocación: llama a una herramienta cuando ninguna encaja en aproximadamente el 25% de los casos de irrelevancia de BFCL, frente al 14% del modelo base.
- Argumentos inventados: en las llamadas espurias genera parámetros ficticios (por ejemplo, `player_name="LeBron James", season="2020-2021"` para una consulta sobre el MVP de la NBA de 2020).
- Solo single-turn: no fue entrenado con conversaciones multi-turno ni con resultados de herramientas, por lo que no debe usarse en bucles de agente sin control externo.
- Solo inglés: la model card declara únicamente el idioma inglés.
- Contexto limitado en entrenamiento: prompts de hasta 1.024 tokens; no se garantiza comportamiento fuera de ese rango.
- No se comprobó el olvido de otras habilidades del modelo base.
- Uso investigador: los términos del dataset xLAM restringen el uso a fines de investigación académica; el adaptador se publica como artefacto de investigación.
- No usar en producción donde una llamada innecesaria tenga coste (pagos, mensajes, escrituras en base de datos) sin una verificación previa.
- Riesgo de alucinación inherente al modelo base, no evaluado específicamente en este adaptador.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vinnvinn/trigger-happy-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto: https://github.com/Vidushi2709/trigger-happy
- Informe completo: https://github.com/Vidushi2709/trigger-happy/blob/main/REPORT.md
- Dataset Salesforce/xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset MadeAgents/xlam-irrelevance-7.5k: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Paper APIGen (arXiv:2406.18518): https://arxiv.org/abs/2406.18518
- Paper xLAM (arXiv:2410.04587): https://arxiv.org/abs/2410.04587
