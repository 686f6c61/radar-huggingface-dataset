# usezn/Galvanize-3

## Resumen

Galvanize 3 es un clasificador binario especializado en la detección de *prompt injection*: texto diseñado para tomar el control de un modelo o agente de IA contra las instrucciones de su desarrollador o usuario. Ha sido desarrollado por usezn y constituye el modelo que valida cada llamada a la API de usezn.com desde el 23 de octubre de 2026, además de ser el motor de la comprobación en la nube opcional de zn-gate, una capa de seguridad local y open source para agentes de programación con IA.

El modelo es un *fine-tune* de Horizon-Labs/prompt-injection-guard-small, que a su vez se basa en jhu-clsp/mmBERT-small (arquitectura ModernBERT), con unos 140 millones de parámetros, soporte multilingüe y una ventana de 512 tokens. A diferencia de los detectores orientados al chat de usuario, está pensado para analizar el texto que un agente *lee*: salidas de herramientas, resultados de MCP, páginas web, correos o documentos de un repositorio. Su relevancia actual radica en el auge de los agentes autónomos con acceso a contenido no confiable, donde la inyección de instrucciones es uno de los vectores de ataque más frecuentes. Se distribuye bajo licencia Apache-2.0 con pesos en safetensors y exportación ONNX lista para inferencia en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (clasificador de secuencia, basado en mmBERT-small) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (se publican pesos en precisión completa; sin cuantizaciones oficiales) |
| Idiomas soportados | multilingüe, inglés (idiomas y dominios no evaluados quedan fuera de alcance) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

Galvanize 3 parte de Horizon-Labs/prompt-injection-guard-small, un clasificador construido sobre jhu-clsp/mmBERT-small, una variante multilingüe de la familia ModernBERT. ModernBERT emplea mejoras recientes de la arquitectura transformer encoder —rotary position embeddings (RoPE), atención eficiente para secuencias largas y fusiones de operaciones que aceleran la inferencia en CPU y GPU—, lo que resulta idóneo para un clasificador ligero que debe inspeccionar alto volumen de texto con baja latencia. La salida del modelo es un *margin* (logit de INJECTION menos logit de SAFE), del que se obtiene la probabilidad de inyección mediante sigmoide.

Los detalles del proceso de entrenamiento (número de tokens, composición exacta del dataset, uso de técnicas como DPO o RLHF) no se han publicado en la información disponible. Sí se documenta el protocolo de inferencia recomendado: aplanado de espacios en blanco (`" ".join(text.split())`), truncado a 512 tokens, y umbral de decisión en producción de 0.9802 de probabilidad (margin 3.9034), notablemente más alto que el umbral por defecto de 0.5, con el fin de minimizar falsos positivos en trabajo legítimo. El repositorio incluye un normalizador de entrada heredado del modelo base en el tokenizador.

## Capacidades

- Clasificación binaria de texto como inyección de prompt o seguro, con salida de probabilidad entre 0 y 1 y un *margin* logit adicional.
- Detección de intentos de anular o ignorar instrucciones, mensajes falsos de sistema o desarrollador, y trucos con delimitadores.
- Detección de *jailbreaks* orientados a eliminar las reglas del modelo.
- Detección de intentos de extracción del system prompt.
- Detección de instrucciones plantadas para agentes en documentos, páginas web, correos o salidas de herramientas (incluidos resultados de MCP).
- Soporte multilingüe heredado de mmBERT-small (inglés y otros idiomas; solo el inglés y los dominios evaluados están validados).
- Inferencia eficiente en CPU mediante ONNX Runtime con el grafo que sirve la API de zn.
- Integrable como capa de *guardrails* en pipelines de agentes, junto a otras defensas.
- No es un modelo de moderación de contenidos: no detecta solicitudes dañinas sin intento de anulación de instrucciones.

## Casos de uso

- **Filtrado de entradas no confiables en agentes de IA:** inspeccionar cada salida de herramienta, resultado de MCP o página web rastreada antes de que el agente actúe sobre ella; con 512 tokens de ventana y clasificación en CPU, es viable aplicarlo a cada fragmento leído.
- **Seguridad en agentes de programación (coding agents):** vía zn-gate, analizar documentos y archivos de repositorios que el agente ingiere, bloqueando instrucciones maliciosas ocultas en READMEs, código o comentarios.
- **Capa de defensa en profundidad en aplicaciones LLM:** combinar el clasificador con herramientas de mínimo privilegio, listas de permitidos y confirmación humana para acciones sensibles, usando el umbral 0.9802 para reducir interrupciones legítimas.
- **Protección de APIs de LLM:** interponer el clasificador delante de cada prompt de usuario en un servicio multiusuario, tal como hace la propia API de usezn.com en producción.
- **Análisis de correo y mensajería automatizada:** examinar correos entrantes que alimentan flujos de automatización con LLM, detectando instrucciones plantadas dirigidas al agente que los procesa.
- **Detección de intentos de extracción del system prompt:** aplicar el modelo sobre las conversaciones de usuario para identificar peticiones que buscan revelar las instrucciones internas del sistema.
- **Auditoría y registro de seguridad:** registrar la probabilidad de inyección de cada texto procesado por una aplicación para construir métricas de ataque y alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona una evaluación en dominios e idiomas concretos, pero no incluye las cifras ni la metodología. No se han publicado métricas de precisión, recall, F1 o tasa de falsos positivos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 140 millones de parámetros en precisión completa (~560 MB de pesos, repo total de 1,2 GB), el modelo cabe con holgura en GPUs modestas; la inferencia en CPU es totalmente viable mediante ONNX Runtime (el ejemplo oficial usa `CPUExecutionProvider`).
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU de consumo (por ejemplo, una RTX 3060 o superior) es más que suficiente si se desea aceleración. No se publican recomendaciones específicas de GPU.
- Consumer GPUs: sí, cabe sin problemas en prácticamente cualquier GPU de consumo actual, incluidas las de gama baja con 4 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (vía de uso recomendada y documentada), transformers de Hugging Face (requiere `transformers>=4.48`), y como servicio gestionado a través de la API de usezn.com o la comprobación en la nube de zn-gate. No se menciona soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado cifras; al tratarse de un encoder de ~140M de parámetros ejecutable en CPU con secuencias de hasta 512 tokens, se espera latencia baja, pero no hay datos concretos disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| usezn/Galvanize-3 | 140,6 M | 512 tokens | Detección de prompt injection (texto leído por agentes) | Apache-2.0 | safetensors + ONNX, HF |
| Horizon-Labs/prompt-injection-guard-small | no disponible | no disponible | Detección de prompt injection (modelo base) | Apache-2.0 | HF |
| usezn/Galvanize-2 | no disponible | no disponible | Detección de prompt injection (predecesor) | no disponible | HF |
| usezn/Galvanize-60M | no disponible | no disponible | Detección de prompt injection (predecesor, ~60M) | no disponible | HF |

Galvanize 3 sucede a Galvanize-2 y Galvanize-60M, que siguen disponibles. Frente a su modelo base, añade un ajuste fino orientado a producción con un umbral de servicio calibrado (0.9802) y exportación ONNX con salida de *margin*.

## Limitaciones y advertencias

- No es un modelo de moderación de contenidos: no detecta toxicidad, contenido dañino ni datos personales; para ello se requieren clasificadores dedicados.
- Un clasificador puede ser evadido: no debe ser el único control delante de acciones irreversibles (envío de correos, movimientos de dinero, ejecución de código).
- Evalúa el texto de forma aislada: no puede juzgar si una instrucción es legítima en un contexto determinado.
- Idiomas y dominios no incluidos en la evaluación no están probados; su comportamiento en ellos es desconocido.
- El umbral por defecto de 0.5 (comportamiento del `pipeline` de HF y del widget) genera muchos más avisos que el umbral de servicio de 0.9802; hay que medir con datos propios antes de elegir umbral.
- El `pipeline("text-classification")` no aplana los espacios en blanco y requiere `truncation=True` para entradas de más de 512 tokens; desviarse del protocolo de entrada puede alterar los resultados.
- Solo procesa 512 tokens por llamada; textos más largos deben truncarse o fragmentarse, con posible pérdida de contexto en inyecciones situadas al final de documentos largos.
- No se han publicado métricas de rendimiento (precisión, recall, F1), lo que dificulta la evaluación comparativa previa a su adopción.
- Sesgos conocidos: no disponibles; no se ha publicado información sobre sesgos del modelo.
- Riesgo de alucinación: no aplicable como tal al tratarse de un clasificador binario, aunque sí existe riesgo de falsos positivos y falsos negativos no cuantificados públicamente.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usezn/Galvanize-3
- Modelo base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Modelo raíz (mmBERT-small): https://huggingface.co/jhu-clsp/mmBERT-small
- Predecesor Galvanize-2: https://huggingface.co/usezn/Galvanize-2
- Predecesor Galvanize-60M: https://huggingface.co/usezn/Galvanize-60M
- zn-gate (repositorio GitHub): https://github.com/usezn/zn
- Entrada de lanzamiento: https://usezn.com/blog/galvanize-3-is-live-in-the-zn-api/?utm_source=hf&utm_medium=readme&utm_campaign=galvanize-3
- API de usezn: https://usezn.com
