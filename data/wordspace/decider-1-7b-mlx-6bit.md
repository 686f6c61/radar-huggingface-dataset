# wordspace/decider-1.7B-MLX-6bit

## Resumen

decider-1.7B-MLX-6bit es un modelo de decisión de tipo "System 1" desarrollado por wordspace, un fine-tune con LoRA de Qwen/Qwen3-1.7B-Base (1.720.574.976 parámetros) cuantizado a 6 bits para MLX. No es un modelo generativo de propósito general: responde cuatro preguntas cerradas y tipadas sobre pares de notas (contradicción, hipótesis, actualización y pertenencia) en un único forward pass, leyendo la probabilidad calibrada directamente de los logits de los tokens de opción. Se distribuye con licencia Apache 2.0 y pesos en safetensors para mlx-lm.

El modelo nace para el patrón de "LLM wiki" descrito por Andrej Karpathy: una wiki personal que un modelo de lenguaje escribe y mantiene al día a partir de notas propias. Mantener esa wiki coherente exige muchas decisiones pequeñas y repetidas sobre cada nota nueva, y delegarlas en un modelo generativo resulta lento y ruidoso. Este decider asume esas decisiones y deja al modelo generativo solo la redacción, lo que reduce llamadas y falsas alarmas dentro de la app wordspace, donde se ejecuta localmente en un Mac.

Su relevancia práctica está en el coste: 0,14 s por decisión, 1,5 GB de memoria y 1,3 GB en disco en Apple silicon, con una precisión de 280/292 en el conjunto agregado de evaluación. El autor advierte que la ventaja frente a LiquidAI d1-3B (270/292) no es estadísticamente significativa (McNemar exacto, p = 0,087), por lo que su valor diferencial es el tamaño y el consumo, no una superioridad demostrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3-1.7B-Base); sin mezcla de expertos |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información; el autor indica que no se vieron entradas de más de 1024 tokens en entrenamiento |
| Tipos de cuantización | 6 bits en MLX (este repo). El autor reporta que 4 bits degrada la precisión (267/292 frente a 280/292) |
| Idiomas soportados | Entradas en italiano, inglés, español, francés, alemán y portugués; las preguntas se formulan siempre en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 1,4 GB); requiere mlx-lm |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only denso de 1,72 mil millones de parámetros, y se adapta mediante LoRA de rango 16 en todas las capas, con AdamW, tasa de aprendizaje 1e-5, recorte de gradiente por norma 1 y parada temprana sobre la pérdida de validación (mejor paso 1500 de 4425). Posteriormente se fusionan los adaptadores y se cuantiza a 6 bits para MLX. La innovación no está en la arquitectura, sino en la cabeza de decisión: la pérdida se calcula sobre los tokens de opción y en inferencia se lee, en la última posición, la mejor forma de cada token de opción (`yes`/`Yes`/`YES`, `A`/` A`…), seguida de un softmax dividido por la temperatura de calibración 2,25 definida en `calibration.json`. La temperatura modifica la confianza reportada, nunca la opción elegida.

El entrenamiento usó 35.400 preguntas sintéticas generadas a partir de plantillas escritas a mano en seis idiomas, con contraejemplos para atajos conocidos (mismo sujeto reformulado, notas cortas, documentos como fuentes, pares compatibles). La validación empleó plantillas que el entrenamiento nunca vio y no se usaron notas personales. En la evaluación se descartaron los casos generados que compartieran cualquier secuencia de ocho palabras con los conjuntos de test, para evitar fuga de datos.

## Capacidades

- Clasificación de contradicción: dado un par de notas, decide si se contradicen sobre el mismo asunto (sí/no).
- Clasificación de hipótesis: dada una frase, distingue entre valor decidido (A) y mera propuesta, oferta, idea o hipótesis (B).
- Detección de actualización: dadas una frase anterior y otra posterior, decide si la segunda actualiza a la primera (A) o si dos fuentes entran en desacuerdo (B).
- Pertenencia a página: dada una página temática y una nota, decide si la nota corresponde a esa página (sí/no).
- Salida probabilística calibrada en un solo forward pass, sin generación autoregresiva de texto.
- Soporte multilingüe de entrada en it, en, es, fr, de y pt, con preguntas fijas en inglés.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: la model card no declara ninguna de estas capacidades.
- No es un modelo de chat ni de generación libre; la interfaz es un prompt exacto construido con `protocol.py` y una lectura de logits.

## Casos de uso

- Mantenimiento de una wiki personal de notas: el modelo se invoca por cada nota nueva para decidir si contradice, actualiza o pertenece a una página existente, y solo cuando responde afirmativamente se llama al modelo generativo que redacta la página. El ahorro medido en la app es de un tercio menos de llamadas al generativo.
- Reducción de falsos positivos en comprobaciones de consistencia: en el conjunto gold de 154 pares, integrado en el chequeo de contradicciones de la wiki, produce 2 falsas alarmas frente a 7 con d1-3B. Adecuado como segunda etapa tras reglas deterministas que ya comparan hechos legibles por código.
- Enrutado o gating previo en pipelines RAG: usar la salida calibrada como señal barata para decidir si dos fragmentos recuperados entran en conflicto antes de gastar una llamada a un LLM mayor, con 0,14 s por decisión en Apple silicon.
- Clasificación de notas de reuniones o investigación: separar lo decidido de lo meramente propuesto con la tarea `hypothesis`, útil para generar actas o listas de acciones a partir de notas en seis idiomas.
- Control de versiones de documentación técnica: detectar si un fragmento nuevo de documentación actualiza al anterior o si dos fuentes del mismo dato discrepan, aplicable a changelogs y bases de conocimiento internas.
- Procesamiento local con privacidad: al ejecutarse en MLX sobre el Mac del usuario con 1,5 GB de memoria, permite clasificar notas personales o internas sin enviar el texto a un servicio externo.
- Etiquetado por lotes de baja latencia: clasificación de pares de frases en pipelines de análisis documental donde el coste por elemento debe mantenerse por debajo de una fracción de segundo y el presupuesto de memoria es inferior a 2 GB.

## Benchmarks y rendimiento

Evaluación del autor sobre casos no usados en entrenamiento: 154 pares de notas escritos a mano (gold, siete conjuntos en seis idiomas) y 138 preguntas del "Liquid bench" que cubren las cuatro tareas.

| Conjunto | Este modelo | LiquidAI d1-3B (MLX 4 bit) |
|---|---|---|
| Gold (154) | 143/154 | 139/154 |
| Liquid bench (138) | 137/138 | 131/138 |
| Total (292) | 280/292 | 270/292 |

| Tarea (gold + Liquid bench) | Este modelo | LiquidAI d1-3B |
|---|---|---|
| Contradicción (208) | 196/208 | 187/208 |
| Hipótesis (36) | 36/36 | 35/36 |
| Actualización (24) | 24/24 | 24/24 |
| Pertenencia (24) | 24/24 | 24/24 |

- Sonda independiente de 630 pares mínimos escritos a mano: 613/630.
- Significación: McNemar exacto, 19 aciertos exclusivos frente a 9 de d1-3B, p = 0,087 (diferencia no significativa).
- Integrado en el chequeo de contradicciones de la wiki: 2 falsas alarmas frente a 7, y un tercio menos de llamadas al modelo generativo (p = 0,07, tampoco significativo).
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es un clasificador y no un generador evaluable con esas pruebas.

## Requisitos de hardware

- Memoria en ejecución: 1,5 GB según el autor; el repo ocupa 1,3 GB en disco.
- Latencia: 0,14 s por decisión medida en la app sobre Apple silicon (modelo cuantizado a 6 bits con MLX).
- GPU recomendadas: Apple silicon con MLX (series M1, M2, M3, M4). El modelo se publica únicamente en formato MLX, por lo que no hay pesos listos para CUDA, ROCm o CPU sin conversión.
- Cabe en hardware de consumo: cualquier Mac con 8 GB o más de memoria unificada; el cuello de botella no es la VRAM sino el soporte de MLX.
- Opciones de despliegue: `mlx-lm` (instalación con `pip install mlx-lm`, descarga con `hf download wordspace/decider-1.7B-MLX-6bit --local-dir decider` y ejecución de `example.py`); integración en la app wordspace. No se documentan despliegues con vLLM, TGI, llama.cpp u Ollama, y para usarlos habría que reconvertir los pesos.
- Throughput agregado: no disponible en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Resultado reportado |
|---|---|---|---|---|
| decider-1.7B-MLX-6bit (wordspace) | 1,72 B | Decisión tipada, 4 preguntas, 6 bits MLX | Apache 2.0 | 280/292 en el conjunto del autor, 0,14 s y 1,5 GB en Apple silicon |
| LiquidAI d1-3B (MLX 4 bit) | 3 B (según el nombre) | Decisión en un forward pass | No disponible en la información | 270/292 en el mismo conjunto |
| pplx-decider-v1-27b (Perplexity AI) | 27 B | Modelo de decisión afinado desde Qwen3.8-27B | No disponible en la información | Precisión medida a través de la API de Perplexity; sin datos en la información |
| Strands Decider 2B (AWS Strands Labs) | 1,9 B | Decisión local entre opciones o puntuación con confianza calibrada, un forward pass | Apache 2.0 | No disponible en la información |
| Mapika/decider (GitHub) | No disponible | Familia de modelos System 1 afinados desde Qwen3.5 | No disponible en la información | No disponible en la información |

Contexto: el modelo de wordspace está entrenado para cuatro preguntas concretas y un formato de prompt fijo, mientras que propuestas como laya o Strands Decider 2B se presentan como decisores de propósito más general; la comparación directa de precisión solo es posible con d1-3B, que es la que reporta el autor.

## Limitaciones y advertencias

- Inferior a d1-3B en contradicciones entre números y fechas (39/43 frente a 43/43) y en contradicciones implícitas que requieren conocimiento del mundo (6/11 frente a 8/11).
- Entrenado solo para cuatro preguntas y un formato de prompt concreto; otras preguntas o formulaciones están sin probar. El prompt debe construirse con `protocol.py` carácter a carácter.
- No se vieron en entrenamiento entradas de más de 1024 tokens; los pares de notas largos quedan fuera del régimen validado.
- La cuantización a 4 bits pierde precisión de forma medible (267/292 frente a 280/292 en el conjunto total); no se recomienda bajar de 6 bits.
- La ventaja sobre d1-3B no es estadísticamente significativa (p = 0,087), y la mejora en falsas alarmas dentro de la wiki tampoco (p = 0,07); conviene no presentarla como superioridad consolidada.
- Riesgo de alucinación estructural bajo en la selección de opción, pero la probabilidad reportada depende de la temperatura de calibración 2,25: recalibrar sin ese valor invalida la confianza mostrada.
- Sesgos: no se documentan análisis de sesgo demográfico, cultural o lingüístico; el modelo se entrenó con datos sintéticos generados a partir de plantillas, lo que puede introducir sesgos de formulación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repo remite a un fichero `NOTICE` con la lista completa de cambios que debe conservarse.
- Dependencia de plataforma: los pesos son MLX, lo que limita el despliegue a Apple silicon salvo conversión manual.
- Advertencia de producción: el modelo no genera texto ni razona; usarlo como sustituto de un LLM generativo produciría resultados vacíos. Su función es la clasificación cerrada previa a la generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wordspace/decider-1.7B-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- App wordspace: https://getwordspace.com
- Ficheros citados en el repo: `protocol.py`, `calibration.json`, `example.py`, `NOTICE` (en https://huggingface.co/wordspace/decider-1.7B-MLX-6bit/tree/main)
- Mapika/decider (familia de modelos System 1): https://github.com/Mapika/decider
- pplx-decider-v1-27b (Perplexity AI): https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- NandhaKishorM/laya (motor de decisión no autorregresivo): https://github.com/NandhaKishorM/laya
- Strands Decider 2B (AWS Strands Labs): https://ai-tldr.dev/models/strands-decider-2b/
- MLX Community en HuggingFace: https://huggingface.co/mlx-community
