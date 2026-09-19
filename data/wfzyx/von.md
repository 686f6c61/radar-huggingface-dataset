# wfzyx/von

## Resumen

Von 1.1 es un modelo de decisión «System One» no autorregresivo, publicado por el usuario wfzyx (Victor Hugo Panisa, según la cita del repositorio) bajo licencia Apache-2.0. Se construye sobre el backbone encoder ModernBERT-large, con 395.834.371 parámetros, y le añade una cabeza de puntuación denominada Option-Marker. En lugar de generar texto token a token, empaqueta la premisa y todas las opciones candidatas en una única secuencia, inserta un marcador `[MASK]` por opción y devuelve en un solo paso forward bidireccional una distribución de probabilidad sobre el conjunto de opciones.

El problema que resuelve es concreto: las decisiones estructuradas (elegir una opción, juzgar una condición, asignar un nivel) son un cuello de botella habitual en agentes y pipelines de automatización, y resolverlas con un modelo generativo implica una generación completa por cada candidato. Von hace la puntuación conjunta de todas las opciones en una sola pasada de encoder, con coste independiente del número de opciones, una ventana de contexto de 8.192 tokens y probabilidades calibradas mediante un mapa de temperatura condicionado por la entrada.

Es relevante para quien despliega enrutadores, clasificadores de intención o triaje de decisiones con requisitos de latencia y coste ajustados, porque sustituye el muestreo autoregresivo por una inferencia de encoder única. Sus puntos débiles declarados por el autor son igualmente claros: solo inglés, no genera texto y su precisión cae cerca del azar en razonamiento multi-salto sobre documentos largos de tipo legal o de políticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional no autorregresivo (backbone ModernBERT-large) con cabeza de puntuación Option-Marker |
| Parámetros totales | 395.834.371 (≈395 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible: no se documentan versiones GGUF, AWQ, GPTQ ni int8. El repositorio distribuye safetensors y PyTorch (`option_marker.pt`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`option_marker.pt`), JSON de calibración (`marker_calibration.json`), `config.json` y tokenizer estándar de HuggingFace |
| Versión | 1.1 (`von-1.1.0`); publicado previamente como `wfzyx/von-1.0` |
| Pipeline declarado | zero-shot-classification |
| Librería | von-sdk |
| Modelo base | answerdotai/ModernBERT-large |
| Tamaño del repositorio | 7,9 GB |
| Descargas / likes | 14.276 / 32 |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura parte de ModernBERT-large, un encoder transformer bidireccional con atención sobre 8.192 tokens, y le superpone una cabeza de puntuación Option-Marker. El mecanismo clave es el empaquetado conjunto: la premisa (`state`) y todas las opciones candidatas se serializan en una sola secuencia, cada opción recibe un marcador `[MASK]` que atiende simultáneamente al estado y al resto de opciones, y una única pasada forward produce la distribución de probabilidad sobre el conjunto completo. Al no haber decodificación autoregresiva ni cadena de pensamiento, el coste es de un paso de encoder sea cual sea el número de candidatos.

Sobre la calibración, el autor documenta un mapa de temperatura condicionado por la entrada: una función lineal acotada de la entropía de la distribución de opciones, la longitud del estado y el número de opciones, almacenada en `marker_calibration.json` bajo la clave `calibration_map`. El ajuste se realizó sobre los 231 ítems públicos de JevBench. Como el escalado de temperatura es monótono, no altera la opción elegida, solo la confianza declarada. El autor indica que ningún ítem de JevBench se usó para entrenamiento por gradiente. Una sonda de distancia entre marcadores confirma que el modelo lee la premisa con precisión hasta aproximadamente 2.048 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF o DPO. En un modelo no generativo de selección entre opciones estas técnicas no resultan de aplicación directa; en cualquier caso, la información disponible no las menciona.

## Capacidades

- Clasificación zero-shot: asignar una categoría a un texto sin entrenamiento específico, formulando las categorías como opciones.
- Toma de decisiones estructuradas: elegir una opción entre varias, juzgar si se cumple una condición y asignar un nivel dentro de una escala.
- Puntuación conjunta de opciones: las alternativas se puntúan simultáneamente en un solo paso, no una a una.
- Probabilidades calibradas: devuelve `choice` y `confidence`, con confianza derivada de un mapa de temperatura condicionado por la entrada.
- Inferencia no generativa: no produce texto libre, de modo que no hay riesgo de alucinación de contenido en la salida; la salida es una distribución sobre las opciones suministradas.
- Latencia independiente del número de opciones: al ser una sola pasada de encoder, añadir candidatos no añade pasos de decodificación.
- Despliegue como servicio: servidor nativo con endpoint `/v1/systemone` compatible con TypeSafe (`von serve --model von-1.1 --port 8000`).
- SDK en dos lenguajes: Python (`pip install "von-sdk>=1.1.0"`) y TypeScript/JavaScript (`npm install von-sdk`).
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente en inglés.
- Tool calling / function calling, agentes multi-paso, visión, audio y modo de razonamiento explícito: no disponibles ni documentados.

## Casos de uso

- Enrutado de tickets de soporte: el caso que ilustra el propio README. Dado un estado como «el pedido #123 nunca se entregó y el cliente pide el reembolso», el modelo elige entre `refund`, `track_order` o `escalate` en una sola pasada. Es adecuado porque la decisión es discreta y el coste no crece al añadir rutas alternativas.
- Triaje con escalado a humano: usando el valor de `confidence` como umbral, se puede derivar automáticamente a un agente humano todo lo que caiga por debajo de un nivel de confianza. El modelo es apropiado aquí precisamente porque sus probabilidades están calibradas y la temperatura se ajustó para que los ítems difíciles admitan estar cerca del azar.
- Moderación de contenido con taxonomías cambiantes: al ser zero-shot, se pueden redefinir las categorías de política sin reentrenar ni reetiquetar datos; basta con reescribir las opciones.
- Clasificación de intenciones en asistentes conversacionales o voicebots: con 8.192 tokens de contexto se puede incluir el historial reciente de la conversación y decidir la intención en un solo forward, lo que resulta adecuado para presupuestos de latencia estrictos.
- Preetiquetado para pipelines de anotación: generar etiquetas iniciales sobre grandes volúmenes de texto e introducir solo la revisión humana de los casos con baja confianza, reduciendo el coste de anotación.
- Selección de acción en un agente: aunque no implementa tool calling nativo, la elección de herramienta puede formularse como una decisión entre opciones, usando el modelo como enrutador de bajo coste antes de invocar el LLM generativo principal.
- Evaluación de condiciones en reglas de negocio: comprobar si una solicitud cumple un criterio expresado en lenguaje natural (por ejemplo, elegibilidad o cumplimiento de requisitos) con independencia de que el texto de entrada sea largo.
- Puntuación de severidad o urgencia: asignar un nivel dentro de una escala definida (baja, media, alta) para priorizar colas de trabajo.
- Verificación en pipelines RAG: decidir si un contexto recuperado responde efectivamente a la pregunta del usuario, como filtro previo a la generación.

## Benchmarks y rendimiento

El autor publica resultados sobre los splits públicos de JevBench con su arnés oficial. No hay resultados disponibles de MMLU, GSM8K, HumanEval ni de otros benchmarks generativos, y en un modelo no generativo estas pruebas no son directamente aplicables.

Precisión por split (JevBench, arnés oficial):

| Split | n | Precisión |
|---|---:|---:|
| easy | 48 | 0,938 |
| original (standard) | 72 | 0,653 |
| hard (mitad pública) | 111 | 0,351 |

Calibración medida sobre los ítems públicos de JevBench con su métrica `ece_top_label`:

| Nivel | Precisión | Confianza media | ECE |
|---|---:|---:|---:|
| easy | 93,8 % | 88,1 % | 0,060 |
| standard | 66,7 % | 79,5 % | 0,133 |
| hard | 36,9 % | 46,0 % | 0,090 |

Advertencia del propio autor: el mapa de calibración se ajustó sobre los 231 ítems públicos de JevBench, por lo que estas cifras de calibración son in-sample. La validación por mitades (ajuste sobre una mitad y evaluación sobre la otra) sitúa el eje de calibración de JevBench en el rango 68-82. El autor señala además que Von es más fuerte en decisiones cortas y bien formuladas, y más débil en documentos largos de políticas con múltiples cláusulas que exigen composición multi-salto.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del recuento de parámetros de 395.834.371; el repositorio no documenta cuantizaciones oficiales): en fp32 ≈ 1,6 GB; en fp16/bf16 ≈ 0,8 GB; en int8 ≈ 0,4 GB. A ello hay que sumar activaciones y memoria de atención, que crecen con la longitud de la secuencia hasta 8.192 tokens.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica; el modelo cabe sin problemas en una RTX 3060, RTX 4060, RTX 4090, A100 o H100. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas, y previsiblemente también en CPU para cargas moderadas.
- Opciones de despliegue: servidor nativo mediante `von serve --model von-1.1 --port 8000`, que expone el endpoint `/v1/systemone` compatible con TypeSafe; SDK de Python (`von-sdk`) y de TypeScript/JavaScript (`von-sdk` en npm). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, lo cual es coherente con un modelo no autorregresivo sin pesos GGUF.
- Latencia y throughput estimados: no disponibles en cifras. Estructuralmente, la latencia corresponde a una única pasada de encoder y no escala con el número de opciones, a diferencia de un enfoque generativo que requeriría una generación por candidato.

## Comparativa con modelos similares

No se dispone de comparaciones de rendimiento publicadas frente a alternativas. La tabla siguiente contrasta únicamente características estructurales; los datos de los modelos alternativos no provienen de la información proporcionada y se marcan como aproximados.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento comparado |
|---|---:|---:|---|---|---|
| wfzyx/von 1.1 | 395 M | 8.192 | Decisión estructurada y clasificación zero-shot no autorregresiva | Apache-2.0 | Resultados JevBench en la tabla anterior |
| answerdotai/ModernBERT-large (modelo base) | ≈395 M | 8.192 | Encoder de propósito general para clasificación y recuperación | Apache-2.0 | No disponible |
| Clasificadores zero-shot tipo DeBERTa-v3-large (MNLI) | ≈435 M (aprox.) | 512 (aprox.) | Clasificación zero-shot por entailment | MIT | No disponible |
| Clasificadores zero-shot tipo BART-large-MNLI | ≈407 M (aprox.) | 1.024 (aprox.) | Clasificación zero-shot por entailment | MIT | No disponible |

La diferencia funcional relevante frente a los clasificadores por entailment es el modo de decisión: Von puntúa todas las opciones de forma conjunta en una sola secuencia, mientras que el enfoque de entailment evalúa cada hipótesis por separado. No hay datos en la información disponible que permitan afirmar cuál rinde mejor en una tarea concreta.

## Limitaciones y advertencias

- Idioma: únicamente inglés. No hay soporte multilingüe declarado.
- Modelo no generativo: selecciona y puntúa opciones, no escribe texto. No sirve para generación, resumen, traducción ni diálogo abierto.
- Razonamiento multi-salto largo: el autor advierte de un rendimiento cercano al azar en razonamiento jurídico o de políticas con múltiples cláusulas encadenadas, y desaconseja su uso sin supervisión para adjudicación de contratos de alto riesgo.
- Contexto efectivo: aunque la ventana declarada es de 8.192 tokens, la sonda de distancia entre marcadores solo confirma una lectura precisa de la premisa hasta aproximadamente 2.048 tokens. La caída en el nivel difícil se atribuye a profundidad composicional, no a recuperación.
- Calibración dependiente del dominio: el mapa se ajustó sobre datos públicos de benchmark y puede derivar en dominios muy distintos. El propio autor recomienda reajustar con `benchmarks/fit_calibration.py` si se depende de los valores de confianza.
- Dependencia del conjunto de opciones: al puntuar las opciones de forma conjunta y atender entre sí, el resultado depende de qué alternativas se presenten y de cómo se redacten. Cambiar el conjunto de candidatos puede alterar la puntuación de una opción concreta.
- Sesgos conocidos: no se documenta ningún análisis de sesgos en la información disponible.
- Licencia: Apache-2.0, que permite uso comercial sin restricciones adicionales documentadas. No se declaran cláusulas de uso aceptable adicionales.
- Nomenclatura: el repositorio se renombró desde `wfzyx/von-1.0`; el identificador antiguo sigue redirigiendo, pero conviene fijar la versión en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wfzyx/von
- Repositorio GitHub: https://github.com/wfzyx/von
- Identificador anterior: https://huggingface.co/wfzyx/von-1.0
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Cita: Panisa, Victor Hugo (2026), «Von: An Open-Source System One Decision Model», https://github.com/wfzyx/von
- JevBench: no disponible (no se proporciona URL del benchmark en la información recibida)
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (enlaces de inicio de sesión y páginas públicas de Snapchat), por lo que no se ha incorporado ningún enlace adicional procedente de esa búsqueda.
