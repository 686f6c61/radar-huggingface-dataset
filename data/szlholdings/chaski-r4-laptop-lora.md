# SZLHOLDINGS/chaski-r4-laptop-lora

## Resumen

chaski-r4-laptop-lora es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo licencia Apache 2.0. Según los metadatos del repositorio se trata de un LoRA en formato safetensors, etiquetado como `research-artifact`, `experimental` y `private-estate`, con 32 descargas y sin pipeline declarado. El tamaño del repositorio es de 0,0 GB, lo que sugiere un conjunto de pesos de adaptador de reducidas dimensiones o un repositorio prácticamente vacío.

La model card ha sido reescrita explícitamente para retirar las afirmaciones que contenía en una revisión anterior (una "wave-4 uniform stamp" con model-index, tabla de entrenamiento QLoRA y badges de receipts) porque, según el propio autor, no existe evidencia verificable por modelo en la revisión observada. La tarjeta actual declara de forma literal que no se mide evaluación, benchmark, contrato de entrenamiento, hiperparámetros, dataset, equivalencia de pesos ni cualificación para producción.

El único dato medido que se publica es un "estate-battery" de seis sondas de gobernanza (abstención/refusal) ejecutado el 2026-11-15 sobre una NVIDIA GeForce RTX 4090, con resultado `abstained_or_refused 0 of 6` y joules medidos de 0.0. Se trata de un receipt de comportamiento ante sondas de gobernanza, no de un benchmark de capacidades. En consecuencia, esta ficha no puede caracterizar arquitectura base, tamaño, contexto ni rendimiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No disponible. La model card actual elimina explícitamente cualquier afirmación sobre arquitectura, contrato de entrenamiento, tabla de hiperparámetros o composición del dataset, indicando que no existe evidencia verificable por modelo en la revisión observada. La revisión anterior contenía una tabla de entrenamiento QLoRA, pero el autor la retira por no poder verificarla bajo su doctrina *fail-closed*.

El único procedimiento documentado es una batería de seis sondas de gobernanza ("estate-battery") ejecutada con un rerun de pip fijado el 2026-11-15 sobre una RTX 4090, con receipt público en el dataset `SZLHOLDINGS/frontier-54-runs` (SHA-256 `3a3eeb3251a1e8a5e1cfc3abb851c3729a3a1964bad013e84c22d8128069661f`). El resultado registrado es `abstained_or_refused 0 of 6`, es decir, el checkpoint no se abstuvo ni rechazó ninguna de las seis sondas. Este dato describe comportamiento ante probes de gobernanza, no calidad ni capacidades del modelo.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documenta modo thinking, visión, audio ni ninguna capacidad especial.
- El único comportamiento medido es la respuesta a seis sondas de gobernanza (resultado: 0 de 6 abstenidas/rechazadas), que no equivale a una capacidad funcional del modelo.

## Casos de uso

- Investigación sobre gobernanza y abstención: el artefacto puede emplearse como sujeto de prueba en baterías de sondas que midan si un checkpoint se abstiene o rechaza peticiones problemáticas; el receipt publicado documenta un resultado de 0/6 en este eje.
- Auditoría de procedencia de artefactos: sirve como caso de estudio de una model card reescrita bajo doctrina *fail-closed*, donde se retiran afirmaciones no verificables y se conserva el historial de revisiones.
- Reproducibilidad de receipts: el enlace al receipt en `SZLHOLDINGS/frontier-54-runs` con SHA-256 permite replicar la verificación del registro de la batería.
- Evaluación de prácticas de transparencia en el Hub: útil para investigadores que analicen cómo se documentan (o se retiran) claims en artefactos privados de un estate.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código, RAG ni ningún escenario funcional, porque no hay evidencia publicada de capacidades, contexto, idiomas ni rendimiento.
- No se recomienda su integración en pipelines de CI/CD ni en despliegues con vLLM, llama.cpp, Ollama o TGI, al no documentarse arquitectura base, tokenizador ni requisitos de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna evaluación, benchmark ni resultado de batería como métrica de calidad. El único registro medido es la batería de gobernanza:

| Prueba | Entorno | Resultado | Naturaleza |
|---|---|---|---|
| estate-battery (6 sondas de gobernanza) | RTX 4090, rerun con pip fijado, 2026-11-15 | abstained_or_refused 0 de 6; joules medidos 0.0 | Receipt de abstención/refusal, no benchmark |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la única GPU mencionada es la NVIDIA GeForce RTX 4090 empleada para ejecutar la batería de gobernanza, no para inferencia funcional documentada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta arquitectura base ni tokenizador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la arquitectura base, el tamaño ni la tarea del artefacto, por lo que no es posible establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evidencia verificable: el autor retira explícitamente claims de evaluación, entrenamiento, dataset, equivalencia de pesos y cualificación para producción.
- La revisión anterior de la model card contenía afirmaciones (model-index, tabla QLoRA, badges) que el autor considera no verificables bajo su doctrina; no deben tomarse como datos válidos.
- El resultado de la batería de gobernanza (0 de 6 abstenciones/rechazos) indica que el checkpoint no se abstuvo ante ninguna sonda, lo que en un contexto de gobernanza puede ser una señal de riesgo, no de calidad.
- No se documentan sesgos conocidos, pero tampoco se documenta nada que permita descartarlos.
- Riesgo de alucinación: no evaluable con la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero la ausencia de documentación técnica hace inviable un despliegue responsable en producción.
- El repositorio figura como `private-estate` y `experimental`; su disponibilidad y visibilidad pueden cambiar sin previo aviso.
- El tamaño de 0,0 GB y las 32 descargas sugieren un artefacto de nicho o de escasa utilidad práctica fuera del contexto del estate.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r4-laptop-lora
- Receipt de la batería (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_r4_laptop_lora.json
- Dataset frontier-54-runs: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Revisión observada antes de la reescritura: `cf73696736b8a82ab911da0a6230aedacb0d03ac`
