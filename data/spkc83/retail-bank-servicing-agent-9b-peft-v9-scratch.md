# spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch

## Resumen

`spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch` es un adaptador LoRA de tipo *low-rank adaptation* creado por el desarrollador `spkc83` como parte de una demostración de investigación para un servicio de atención al cliente bancario sintético. Se trata de un adaptador de bajo rango (rank 32, alpha 64) entrenado sobre el modelo base `spkc83/retail-bank-servicing-agent-9b`, que cuenta con aproximadamente 8,8 mil millones de parámetros. El adaptador está diseñado para especializar el modelo en tareas de tool calling y conversación en el dominio de banca minorista, usando un formato de llamada a herramientas JSON etiquetado.

El modelo se distribuye únicamente como adaptador LoRA en formato BF16, sin pesos fusionados ni `config.json`, por lo que debe cargarse mediante `PeftModel` sobre el modelo base en una revisión concreta. Su relevancia radica en demostrar un enfoque eficiente de ajuste fino (PEFT) para un caso de uso vertical, con un dataset de entrenamiento pequeño (5.747 registros) y una longitud de contexto máxima de 2048 tokens. Está pensado exclusivamente para un POC público de demostración y no tiene acceso a sistemas bancarios reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base no especificada) con adaptador LoRA |
| Parametros totales | ~8,8 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | BF16 (adaptador) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base `spkc83/retail-bank-servicing-agent-9b` en una revisión fija (`1d56824995aa1adecfe20f62ca42fb1c0c443817`). El entrenamiento usa un dataset de alineación SFT (`spkc83/retail-bank-servicing-alignment-sft`) con 5.747 registros de entrenamiento y 397 de validación. El adaptador tiene rango 32 y alpha 64, y se optimiza durante 2000 pasos. Se aplica enmascaramiento de objetivos para las partes de llamada a herramienta y respuesta final del asistente. El dataset incluye un manifiesto de nueve herramientas sintéticas de banca minorista. No se especifican detalles sobre la arquitectura interna del modelo base (p. ej., si es transformer denso o con atención lineal), ni sobre el dataset preentrenado.

## Capacidades

- Generación de texto conversacional en el dominio de banca minorista.
- Llamada a herramientas (tool calling) mediante un formato JSON etiquetado, restringido al conjunto de nueve herramientas sintéticas definidas en el manifiesto.
- Soporte de conversaciones multi-turno con una ventana de contexto de 2048 tokens.
- Capacidad de generar respuestas finales basadas en los resultados de las herramientas, siempre que se proporcionen los esquemas y resultados.
- Entrenado específicamente para escenarios de servicio al cliente bancario, como consultas de saldo, transferencias, etc., aunque sin acceso a sistemas reales.
- No se reportan capacidades adicionales (visión, audio, razonamiento avanzado) en la información proporcionada.

## Casos de uso

- **Atención al cliente bancaria automatizada**: el modelo puede gestionar consultas de clientes sobre productos y servicios bancarios, manteniendo el contexto a lo largo de múltiples turnos gracias a su ventana de 2048 tokens. Es adecuado para un POC de demostración, no para producción.
- **Demostración de llamada a herramientas**: gracias a su formato JSON de tool calling, puede ejecutar acciones simuladas como consulta de saldo o transferencia, siempre que se le proporcionen los esquemas y resultados de las herramientas. Útil para validar pipelines de agentes.
- **Prueba de concepto de fine-tuning eficiente**: al ser un adaptador LoRA, sirve para evaluar cómo un modelo de 8.8B puede especializarse en un dominio vertical con un dataset reducido (menos de 6.000 ejemplos).
- **Investigación sobre tool-calling en entornos sintéticos**: el modelo puede utilizarse para estudiar la sintaxis de llamadas, la selección de argumentos y la robustez fuera de distribución en un contexto controlado.
- **Evaluación de modelos de servicio al cliente**: dado su diseño específico, puede emplearse como baseline para comparar con otros adaptadores o modelos en métricas de exactitud de tool call y respuesta final.
- **Educación y divulgación**: sirve como ejemplo práctico de cómo construir un agente conversacional con PEFT y LoRA, con código de desarrollo disponible en el repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no reporta métricas de evaluación (MMLU, HumanEval, GSM8K u otras) ni comparaciones con modelos similares.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.4 GB, pero el modelo base (~8.8B parámetros) requiere recursos adicionales.
- Para inferencia en BF16, se necesitan al menos 18-20 GB de VRAM (p. ej., una GPU de 24 GB como RTX 4090 o A10G). Con cuantización (p. ej., 4-bit) se podría reducir a ~8-10 GB, pero no se proporcionan configuraciones oficiales.
- El adaptador debe cargarse sobre el modelo base, por lo que no es posible ejecutar el adaptador de forma independiente.
- Despliegue recomendado: usar la librería PEFT de HuggingFace (`PeftModel.from_pretrained`) en un entorno con PyTorch. También podría integrarse con vLLM o TGI si se fusionan los pesos, aunque no hay indicaciones de compatibilidad.
- Latencia y throughput no especificados.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de la misma categoría (agentes bancarios con tool calling) con los que comparar parámetros, contexto o rendimiento. El modelo es un adaptador específico para un POC, no un modelo generalista.

## Limitaciones y advertencias

- Modelo de investigación y demostración, no apto para producción real.
- No tiene acceso a sistemas bancarios reales ni a datos de clientes.
- No es asesoramiento financiero; las respuestas pueden ser incorrectas o no fundamentadas.
- Puede elegir herramientas o argumentos incorrectos, y las respuestas finales pueden ser no fundamentadas.
- Limitado a una ventana de contexto de 2048 tokens, lo que restringe conversaciones largas.
- Solo funciona con el esquema de herramientas sintéticas proporcionado; sin él, el comportamiento no es fiable.
- El adaptador se distribuye en BF16, sin pesos fusionados; requiere el modelo base en una revisión concreta.
- No se han evaluado sesgos ni alucinaciones; se recomienda una evaluación exhaustiva antes de cualquier uso.
- Licencia Apache 2.0, que permite uso comercial, pero el autor indica que es solo para demostración, por lo que el uso comercial real no está respaldado.

## Enlaces

- Repositorio Hugging Face: [spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch](https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch)
- Repositorio de código (GitHub): [spkc83/retail-bank-servicing](https://github.com/spkc83/retail-bank-servicing)
- Modelo base: [spkc83/retail-bank-servicing-agent-9b](https://huggingface.co/spkc83/retail-bank-servicing-agent-9b)
- Dataset: [spkc83/retail-bank-servicing-alignment-sft](https://huggingface.co/datasets/spkc83/retail-bank-servicing-alignment-sft)
