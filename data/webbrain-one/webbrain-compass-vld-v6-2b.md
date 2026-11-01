# webbrain-one/webbrain-compass-vld-v6-2b

## Resumen

WebBrain Compass VLD v6 2B es un modelo multimodal de tipo image-text-to-text afinado por webbrain-one a partir de LiquidAI/LFM3-VL-2B (y de su derivado webbrain-one/lfm3-vld-2b-multipass). Está diseñado específicamente como agente de navegador que opera dentro del navegador mediante WebGPU, sin llamadas a herramientas externas, y sustituye a la generación anterior Compass VLD Tiny v5. Con 1.918.181.888 parámetros (aproximadamente 1,9 mil millones) y un repositorio de 3,9 GB en safetensors, se posiciona como un modelo pequeño orientado a inferencia en el cliente.

El modelo cubre tres roles concretos: chat y preguntas y respuestas de una o varias vueltas sobre texto de página o capturas, con citas byte-exactas del tipo `[WB-W-XXXXXX]`; descripción estructurada de viewports en seis secciones fijas; y decisión mediante el llamado Verify Protocol, que puntúa respuestas propuestas comparando el margen de logits entre "Yes" y "No" y una sonda lineal sobre el estado oculto final (`decision_hidden`).

Su relevancia actual reside en el nicho: agentes de navegador que deben ejecutarse íntegramente en el dispositivo, con una mezcla de entrenamiento auditada en licencias (70.717 filas de entrenamiento y 1.631 de validación) y exportaciones preparadas para ONNX/WebGPU y llama.cpp. No es un modelo de propósito general, sino un componente de decisión y descripción para pipelines de automatización web.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Liquid LFM3-VL; tag `lfm3_vl`), con codificador de visión y decodificador de lenguaje; requiere `trust_remote_code` |
| Parámetros totales | 1.918.181.888 (≈1,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (GGUF); q8f16 y q4f16 (ONNX); LoRA r=32, alpha=64 |
| Idiomas soportados | no disponible en la información proporcionada (la mezcla de entrenamiento incluye QA multilingüe con turco ≥20 %) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (transformers), ONNX (WebGPU), GGUF (llama.cpp), adaptadores LoRA |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un transformer multimodal de la familia LFM3 que combina un codificador de visión con un decodificador de lenguaje; el repositorio declara `custom_code`, por lo que la carga en transformers exige `trust_remote_code=True`. Sobre esa base, webbrain-one aplica un fine-tuning sobre `webbrain-one/lfm3-vld-2b-multipass` con una mezcla multimodal de 70.717 filas de entrenamiento y 1.631 de validación, distribuida en cinco componentes auditados en licencias: `vision_vl2` (46.879 filas, CC-BY-4.0, con WebSight, ScreenParse, MiniWoB++ y renders web sintéticos), `vision_curated` (5.880, permisivas: Orchard MIT, markov-ai Apache-2.0, look-before-you-click MIT), `decision_d1` (7.236, tareas sintéticas internas de decisión de navegador), `routing_compass` (6.950, trazas comerciales de WebBrain, Orchard MIT, Reduced-A11y CC BY 4.0, markov-ai Apache-2.0 y Mind2Web CC BY 4.0) y `chat_inbrowser` (3.822, CC-BY-4.0/CC-BY-SA, con QA multilingüe de página, turco ≥20 %, rechazos de acciones Act, RAG offline y traducciones de consultas).

La innovación técnica destacable no está en la arquitectura del transformer sino en el protocolo de decisión: el modelo responde a la plantilla "Proposed answer: ... Is the proposed answer correct? Answer Yes or No." y la decisión final se toma por el margen de logits Yes menos No, complementado por una sonda lineal entrenada sobre el estado oculto final (`decision_hidden`). El autor excluye explícitamente de la mezcla WebChain, WebLINX y Compass v3. No se documentan en la información disponible detalles sobre número total de tokens, fases de RLHF/DPO ni mecanismos de atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto y respuesta a preguntas de una y varias vueltas sobre texto de página y capturas de pantalla del navegador.
- Respuesta sobre pasajes offline de Wikipedia y Emergency Box con tokens de citación byte-exactos con formato `[WB-W-XXXXXX]`.
- Descripción estructurada de viewports en seis secciones fijas: propósito de la página, texto visible, entradas, señales de estado, bloqueadores e incógnitas.
- Decisión binaria verificable mediante Verify Protocol (puntuación Yes/No por margen de logits y sonda lineal sobre el estado oculto).
- Rechazo educado de peticiones de tipo Act/Dev en el idioma del usuario.
- Capacidades multilingües parciales derivadas de la mezcla `chat_inbrowser` (con presencia significativa de turco).
- Operación sin tool calling ni function calling: el diseño excluye explícitamente llamadas a herramientas en el navegador.
- No se documentan capacidades de audio, thinking mode extendido ni agentes multi-paso autónomos más allá del enrutado y la verificación descritos.

## Casos de uso

- Asistente de página en extensión de navegador: el modelo responde preguntas sobre el contenido visible y las capturas del viewport directamente en WebGPU, sin enviar datos a un servidor, lo que encaja con su naturaleza de modelo in-browser y su tamaño de 1,9 B.
- Verificación de respuestas en pipelines RAG: usando el Verify Protocol, se puntúa una respuesta candidata con el margen Yes/No y la sonda `decision_hidden`, lo que permite filtrar alucinaciones antes de mostrarla al usuario.
- Descripción de estado de UI para automatización: la salida en seis secciones (propósito, texto visible, entradas, señales de estado, bloqueadores, incógnitas) sirve como representación estructurada del viewport para un orquestador de agentes que decide el siguiente paso.
- Citación trazable en asistentes documentales: los tokens `[WB-W-XXXXXX]` permiten enlazar cada afirmación con el pasaje de Wikipedia o Emergency Box de origen, útil en entornos con requisitos de auditabilidad.
- Enrutado de intenciones en asistentes web: el modelo distingue peticiones de consulta frente a acciones o desarrollo y rechaza estas últimas en el idioma del usuario, actuando como primera capa de control en un agente de navegador.
- Despliegue en cliente con llama.cpp u ONNX Runtime Web: las exportaciones Q4_K_M y q4f16 permiten ejecutar el modelo en equipos sin GPU dedicada o directamente en el navegador, adecuado para productos que priorizan privacidad y latencia local.
- Evaluación automatizada de agentes web: el modelo puede emplearse como juez binario de corrección de respuestas en suites de evaluación de agentes de navegador.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (puertas de evaluación internas, no benchmarks académicos estándar):

| Puerta de evaluación | Objetivo | Resultado | Estado |
|---|---|---|---|
| Vision Suite Q4_K_M (E1) | ≥ 44/100 estricto y > 58 (base v5) | 62/100 estricto; rúbrica media 0,8930; 0 errores; 1,13 s de latencia | PASS |
| Vision Suite Q8_0 (E1) | Verificación de referencia | 66/100 estricto; rúbrica media 0,8994; 0 errores; 1,50 s de latencia | PASS |
| Validez de seis secciones (E5) | ≥ 99,0 % | 99,00 % (495/500 casos de validación VL-2 retenidos) | PASS |
| d1 final_test Raw Verify (E3) | ≥ 120/126 verify, 24/24 comp, 0/48 falsos comp, ≥ 23/24 unknown | 122/126 verify, 24/24 comp, 0/48 falsos comp, 24/24 unknown | PASS |
| Chat in-browser retenido (E4) | Idioma ≥ 95 %, Act ≥ 95 %, citas 100 %, 0 fugas | Idioma 95,95 %, Act 100,0 %, citas 100,0 %, fugas 0 | PASS |
| Routing Replay (E2) | Estructurado ≥ 95/100, laxo > 32/89, 0 aciertos por longitud | Estructurado 96/100, laxo 33/89, aciertos por longitud 0 | PASS |

No se han publicado resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 4 GB en BF16 para los 1,9 B de parámetros; aproximadamente 2 GB en Q8_0 y en torno a 1,2-1,5 GB en Q4_K_M, sin contar el codificador de visión ni el overhead de contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM es suficiente para BF16, y GPUs de consumo como RTX 3060, RTX 4060 o superiores para cuantizaciones ligeras.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más en Q4_K_M; el despliegue objetivo es WebGPU en el navegador, por lo que también está pensado para ejecución en cliente.
- Opciones de despliegue: transformers con `trust_remote_code=True`; ONNX Runtime Web (bundle `decoder_q8f16.onnx`, `decoder_q4f16.onnx`, `vision_encoder_fp16.onnx`); llama.cpp mediante los GGUF (`BF16`, `Q8_0`, `Q4_K_M`, `mmproj-F16`) con endpoints `/v1/chat/completions` y `/v1/systemone`; adaptadores LoRA para fine-tuning adicional.
- Latencia: el autor reporta 1,13 s con Q4_K_M y 1,50 s con Q8_0 en su suite de visión; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| WebBrain Compass VLD v6 2B | ≈1,9 B | no disponible | Agente de navegador multimodal in-browser, verificación Yes/No | LFM Open License v1.0 | safetensors, ONNX, GGUF, LoRA |
| LiquidAI/LFM3-VL-2B (base) | ≈2 B | no disponible | Modelo multimodal generalista | LFM Open License v1.0 | safetensors |
| webbrain-one/lfm3-vld-2b-multipass (predecesor) | ≈2 B | no disponible | Afinado intermedio para tareas de navegador | LFM Open License v1.0 | safetensors |
| Compass VLD Tiny v5 (generación anterior) | no disponible | no disponible | Agente de navegador in-browser previo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está afinado para tres roles concretos (chat con citas, descripción de viewport y verificación binaria); no debe esperarse un rendimiento de propósito general comparable a modelos multimodales más grandes.
- No soporta tool calling ni function calling por diseño, lo que limita su integración en pipelines que dependan de herramientas externas.
- Riesgo de alucinación en respuestas de chat: aunque el protocolo de verificación y las citas mitigan parte del problema, el modelo no garantiza corrección factual fuera de los pasajes de referencia.
- Idiomas: no se declaran idiomas soportados en la ficha de HuggingFace; la cobertura multilingüe es parcial y está sesgada por la composición de `chat_inbrowser` (turco ≥20 %), por lo que el rendimiento en castellano no está documentado.
- Licencia LFM Open License v1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- Longitud de contexto no documentada: no es posible planificar escenarios de contexto largo sin verificación empírica.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- El modelo se distribuye con muy poca adopción (17 descargas, 0 likes) y sin validación externa independiente de los resultados reportados por el autor.
- Las cifras de evaluación proceden de puertas internas del autor y no de benchmarks académicos estandarizados, por lo que no son directamente comparables con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b
- Bundle ONNX para WebGPU: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b-onnx
- Exportaciones GGUF para llama.cpp: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b-gguf
- Adaptador LoRA y pesos del proyector: https://huggingface.co/webbrain-one/webbrain-compass-vld-v6-2b-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Afinado intermedio: https://huggingface.co/webbrain-one/lfm3-vld-2b-multipass
