# yzdvai/tiny-injection-guard

## Resumen

Tiny Injection Guard es un clasificador de texto de 13,5 millones de parámetros especializado en detectar *prompt injection* y *jailbreaks*. Lo desarrolla el autor independiente yzdvai como proyecto de fin de estudios (capstone) de AI & Data Science (2026), y se presenta como una primera capa de defensa barata que puede ejecutarse en el propio dispositivo o navegador antes de que el texto llegue a un LLM. Está afinado a partir de `google/electra-small-discriminator` y etiqueta cada entrada como `benign` o `injection`.

El modelo resuelve un problema muy concreto: filtrar instrucciones maliciosas embebidas en prompts de usuario, correos, documentos o páginas web con un coste computacional mínimo. Con 54 MB en fp32 y 14 MB en ONNX int8, es aproximadamente 14 veces más pequeño que los guardas basados en DeBERTa-v3-base (184 M de parámetros), lo que permite desplegarlo en el navegador con transformers.js sin servidor.

Su relevancia actual radica en la adopción masiva de agentes y aplicaciones LLM expuestas a entradas no confiables, donde un filtro de latencia ultrabaja (unos 65 ms por mensaje en CPU de dos hilos) puede complementar, aunque no sustituir, defensas más robustas. La licencia Apache-2.0 facilita su integración comercial, si bien su alcance está limitado al inglés y a 512 tokens de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ELECTRA-small (discriminador), clasificación de secuencias |
| Parámetros totales | 13.549.314 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | fp32 (PyTorch), int8 (ONNX `model_quantized.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye variante cuantizada int8) |

## Arquitectura y entrenamiento

El modelo es un ELECTRA-small discriminador adaptado a clasificación binaria de secuencias. ELECTRA emplea un esquema de preentrenamiento *replaced token detection*: un generador pequeño propone tokens sustitutos y el discriminador aprende a identificar cuáles han sido reemplazados, lo que proporciona una señal de entrenamiento densa sobre todos los tokens y resulta eficiente en parámetros. Sobre esta base, el autor añade una cabeza de clasificación con dos etiquetas (`benign`, `injection`) y ajusta el umbral de decisión a 0,945, almacenado en la configuración del modelo (`injection_threshold`).

El conjunto de entrenamiento ronda los 20.000 textos tras eliminar duplicados exactos y casi duplicados, procedentes de seis fuentes: SPML Chatbot Prompt Injection (solo filas benignas y de system prompt), jackhhao/jailbreak-classification, TrustAIRLab in-the-wild jailbreak prompts, Lakera Gandalf, OpenAssistant oasst2 y XSTest. No se documentan en la información disponible detalles sobre el número de épocas, la composición exacta de hiperparámetros ni si se aplicó RLHF o DPO; al tratarse de un clasificador, el ajuste es supervisado sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de texto como `benign` o `injection`, con probabilidad asociada a la etiqueta de inyección.
- Detección de *prompt injection* directa en prompts de usuario.
- Detección de *jailbreaks* y prompts adversarios del estilo de los recogidos en los datasets de entrenamiento.
- Filtrado de contenido extraído de correos, documentos y páginas web antes de pasarlo a un LLM.
- Inferencia en navegador mediante transformers.js con el modelo ONNX int8.
- Inferencia en CPU con latencia baja (unos 65 ms por mensaje en configuración de dos hilos).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es exclusivamente un clasificador de texto en inglés.

## Casos de uso

- Filtro de entrada en aplicaciones de chat con LLM: colocar el clasificador delante del modelo generativo para descartar prompts que intenten manipular el system prompt, con un umbral de 0,945 que mantiene la tasa de falsos positivos por debajo del 1 % en textos benignos de las mismas fuentes.
- Protección de pipelines RAG: comprobar el texto recuperado de documentos y páginas web antes de insertarlo en el contexto del modelo, para reducir el riesgo de inyección indirecta (con la advertencia de que los correos son su principal punto ciego).
- Moderación en el navegador: integrar el ONNX int8 con transformers.js para validar entradas del usuario en el cliente, sin enviar el texto a un servidor y con un peso de descarga de 14 MB.
- Puerta de bajo coste en sistemas multi-agente: usar el clasificador como primer filtro en cada paso de un agente que recibe texto de fuentes externas, reservando guardas más caros (DeBERTa, PIGuard) solo para los casos dudosos.
- Monitorización y telemetría de seguridad: puntuar en tiempo real los mensajes entrantes de una aplicación en producción para detectar campañas de jailbreak y generar alertas, aprovechando su bajo coste por inferencia.
- Preprocesado en entornos con recursos limitados: desplegar el modelo en dispositivos edge o funciones serverless con CPU compartida, donde los guardas de 184 M de parámetros resultan demasiado lentos o caros.
- Evaluación comparativa de defensas: emplear el modelo como línea base ligera en experimentos de robustez frente a inyecciones, junto a clasificadores mayores.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor. Todas las métricas se calculan sobre conjuntos no usados en entrenamiento ni en el ajuste del umbral. Umbral del modelo: 0,945; el resto de guardas usan 0,5 (su valor por defecto).

| Modelo | Parámetros | Recall mismas fuentes | FPR mismas fuentes | Recall deepset | Recall correos | Recall manuales | FPR NotInject | FPR manuales difíciles |
|---|---|---|---|---|---|---|---|---|
| Tiny Injection Guard (fp32) | 13,5 M | 0,71 | 0,009 | 0,18 | 0,03 | 0,28 | 0,024 | 0,28 |
| Tiny Injection Guard (ONNX int8) | 13,5 M | 0,70 | 0,008 | 0,16 | 0,03 | 0,28 | 0,021 | 0,28 |
| ProtectAI DeBERTa-v3-base v2 | 184 M | 0,86 | 0,109 | 0,41 | 0,41 | 0,93 | 0,434 | 0,32 |
| PIGuard | 184 M | 0,92 | 0,087 | 0,86* | 0,47 | 0,83 | 0,115 | 0,12 |
| TF-IDF + regresión logística | 0,2 M | 0,75 | 0,011 | 0,12 | 0,03 | 0,43 | 0,009 | 0,08 |

\* El paper de PIGuard incluye deepset/prompt-injections en sus datos de entrenamiento.

Latencia medida en CPU de Colab (2 hilos, batch size 1): aproximadamente 65 ms por mensaje para este modelo frente a unos 275 ms para los dos guardas DeBERTa-v3-base. El autor advierte que la latencia en CPU compartida de Colab varía entre sesiones y que los resultados son ligeramente optimistas porque el modelo se eligió tras revisar los resultados de dos ejecuciones de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo fp32 ocupa unos 54 MB y la variante ONNX int8 unos 14 MB.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria; no obstante, el modelo está pensado para CPU.
- Cabe en cualquier GPU de consumo e incluso en navegador; también en dispositivos edge y funciones serverless.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, transformers.js en navegador, y cualquier runtime compatible con ONNX; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (son runtimes orientados a modelos generativos).
- Latencia y throughput: aproximadamente 65 ms por mensaje en CPU de dos hilos (Colab); el throughput escala con el número de hilos y el tamaño de batch, aunque no se publican cifras adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Recall (mismas fuentes) | FPR (NotInject) | Disponibilidad |
|---|---|---|---|---|---|---|
| Tiny Injection Guard | 13,5 M | 512 tokens | Apache-2.0 | 0,71 | 0,024 | Hugging Face, ONNX, navegador |
| ProtectAI DeBERTa-v3-base v2 | 184 M | 512 tokens | no disponible en la información | 0,86 | 0,434 | Hugging Face |
| PIGuard | 184 M | no disponible en la información | no disponible en la información | 0,92 | 0,115 | Hugging Face |
| TF-IDF + regresión logística | 0,2 M | no aplica | no disponible en la información | 0,75 | 0,009 | línea base del propio estudio |

El modelo sacrifica recall en estilos no vistos (0,18 en deepset, 0,03 en correos) a cambio de un tamaño 14 veces menor y una tasa de falsos positivos muy baja en prompts benignos con palabras trampa (0,024 en NotInject, frente a 0,434 de ProtectAI). No es, por tanto, un sustituto de los guardas grandes, sino un filtro previo de bajo coste.

## Limitaciones y advertencias

- Solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Ventana máxima de 512 tokens; los textos más largos se truncan y pueden perder la parte relevante.
- Punto ciego principal: instrucciones ocultas en correos y documentos (recall de 0,03 en el conjunto de correos de llmail-inject-challenge).
- Recall bajo en estilos de ataque no vistos (0,18 en deepset, 0,28 en textos manuales), por lo que no debe usarse como única defensa.
- Tasa de falsos positivos del 28 % en textos manuales "difíciles" con palabras trampa, lo que puede bloquear entradas legítimas en ese subconjunto.
- Los resultados son ligeramente optimistas porque el modelo se seleccionó tras revisar dos ejecuciones de entrenamiento.
- Riesgo de alucinación no aplica (es un clasificador), pero sí de deriva del umbral: usar 0,5 en lugar de 0,945 altera drásticamente la precisión y el recall.
- Licencia Apache-2.0, que permite uso comercial; conviene revisar las licencias de los datasets de entrenamiento (MIT y Apache-2.0 según la model card) si se redistribuye el modelo.
- Proyecto de fin de estudios con 45 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yzdvai/tiny-injection-guard
- Demo en navegador: https://www.yazeed.quest/injection-guard/
- Recorrido interactivo de la arquitectura: https://www.yazeed.quest/injection-guard/architecture/
- Modelo base: https://huggingface.co/google/electra-small-discriminator
- ProtectAI DeBERTa-v3-base v2: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- PIGuard: https://huggingface.co/leolee99/PIGuard
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset NotInject: https://huggingface.co/datasets/leolee99/NotInject
- Dataset microsoft/llmail-inject-challenge: https://huggingface.co/datasets/microsoft/llmail-inject-challenge
- Dataset SPML Chatbot Prompt Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset TrustAIRLab in-the-wild jailbreak prompts: https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
- Dataset Lakera Gandalf: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
