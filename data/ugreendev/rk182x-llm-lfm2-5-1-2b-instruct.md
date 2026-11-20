# UGREENDEV/RK182X-LLM-LFM2.5-1.2B-Instruct

## Resumen

RK182X-LLM-LFM2.5-1.2B-Instruct es una conversión al formato RKNN del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado (w4a16) y empaquetado para el runtime RKNN v1.1.0, pensado para inferencia local en hardware embebido de bajo consumo. El repositorio ocupa 1,0 GB e incluye una única configuración: 8 núcleos NPU, cuantización w4a16 y una longitud de contexto declarada de 128.000 tokens con KVCache en fp16.

El modelo base, LFM2.5-1.2B-Instruct, pertenece a la familia LFM2 de Liquid AI, orientada a modelos compactos con arquitectura híbrida. La model card del derivado no reproduce las especificaciones arquitectónicas del original (número exacto de parámetros, composición del dataset, técnica de alineación), por lo que los detalles de entrenamiento no están disponibles en la información proporcionada.

Su relevancia es acotada pero concreta: permite desplegar un LLM conversacional de ~1.200 millones de parámetros sobre una NPU Rockchip RK1828, un escenario típico de electrónica de consumo, dispositivos de borde y sistemas empotrados donde no hay GPU dedicada. La licencia LFM Open License v1.0 (no Apache 2.0) condiciona el uso comercial y debe revisarse antes de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de Liquid AI; el derivado es una conversion RKNN) |
| Parametros totales | 1.2B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (125k) en la configuracion w4a16-8-128000 |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); aplican ademas los terminos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repo incluye tambien tags gguf en Hugging Face |
| Nucleos NPU | 8 |
| Chips soportados | RK1828 |
| Version de runtime | RKNN v1.1.0 |
| Tamano del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de su identificador (LFM2.5-1.2B-Instruct). La model card se centra en el proceso de conversión: el modelo original se transforma a formato RKNN, se cuantiza a w4a16 y se empaqueta en el directorio `LFM2.5-1.2B-Instruct-w4a16-8-128000`, configurado para 8 núcleos NPU y 128.000 tokens de contexto. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra técnica de alineación; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica relevante de este artefacto es el propio pipeline de conversión y despliegue: cuantización de pesos a 4 bits con activaciones en 16 bits, KVCache en fp16 para preservar calidad en contexto largo, y una implementación de inferencia que debe soportar `shortconv pads=2`, requisito explícito del autor. Esto sugiere que el modelo base emplea capas convolucionales cortas (short convolutions), coherente con las arquitecturas híbridas de la familia LFM2, aunque la model card no lo confirma de forma explícita.

## Capacidades

- Generación de texto conversacional: el sufijo `Instruct` y el pipeline `text-generation` indican ajuste para seguir instrucciones en formato de diálogo.
- Conversaciones multi-turno: el tag `conversational` y la KVCache fp16 con contexto de 128.000 tokens permiten mantener historiales largos.
- Contexto largo: 125k tokens efectivos en la configuración publicada, adecuado para documentos extensos o agentes con memoria de sesión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base LFM2.5 es multilingüe según su familia, pero no se detalla qué idiomas cubre.
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Inferencia en NPU: ejecución nativa sobre Rockchip RK1828 mediante RKNN Runtime v1.1.0.

## Casos de uso

- Asistentes conversacionales en dispositivos empotrados: el modelo cabe en una NPU RK1828 con cuantización w4a16 y 1,0 GB de repositorio, lo que permite integrar un chatbot local en electrodomésticos, routers o equipos industriales sin conexión a la nube.
- Procesamiento de documentos largos en el borde: con 128.000 tokens de contexto, puede resumir manuales, contratos o informes técnicos directamente en el dispositivo, evitando enviar datos sensibles a servidores externos.
- Automatización de atención al cliente en kioscos o terminales: conversaciones multi-turno con historial persistente en la KVCache fp16, ejecutadas localmente para reducir latencia y coste de infraestructura.
- Agentes de voz o texto en robótica de consumo: el bajo consumo de la NPU RK1828 encaja en robots domésticos o dispositivos portátiles que necesitan generar respuestas en lenguaje natural sin GPU.
- Generación de texto en herramientas de accesibilidad: dictado, corrección o reescritura de texto en aplicaciones de escritorio o móviles con chip Rockchip, sin depender de APIs externas.
- Prototipado de pipelines de IA generativa en hardware Rockchip: útil para equipos que evalúan el rendimiento real de un LLM de 1.2B sobre NPU antes de comprometerse con un diseño de producto.
- Filtrado y clasificación de contenido en el borde: respuestas cortas y controladas en entornos con requisitos de privacidad, usando el modelo como clasificador generativo o generador de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, ni datos de latencia o throughput sobre la NPU RK1828.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta sobre NPU Rockchip RK1828, no sobre GPU. El repositorio completo ocupa 1,0 GB, y la cuantización w4a16 reduce la huella de pesos a aproximadamente 4 bits por parámetro.
- GPU recomendadas: no aplica; el artefacto está empaquetado exclusivamente para RKNN Runtime v1.1.0 sobre RK1828. No se documenta ejecución en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el formato RKNN no es directamente ejecutable en CUDA. Para GPU habría que usar el modelo base LiquidAI/LFM2.5-1.2B-Instruct en safetensors o GGUF.
- Opciones de despliegue: RKNN Runtime v1.1.0 con el driver correspondiente; verificación previa con `rknn-smi -v`. La descarga se realiza vía `hf download` (Hugging Face) o `modelscope download` (ModelScope). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponible.
- Requisito adicional: la implementación de inferencia debe soportar `shortconv pads=2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-LLM-LFM2.5-1.2B-Instruct (este) | 1.2B | 128.000 | RKNN (w4a16) | LFM Open License v1.0 | Hugging Face y ModelScope |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1.2B | no disponible en esta ficha | safetensors (presumible) | LFM Open License v1.0 | Hugging Face |
| Modelos GGUF de ~1.2B (p. ej. Qwen2.5-1.5B-Instruct-GGUF) | ~1.5B | variable segun configuracion | GGUF | Apache 2.0 en Qwen2.5 | Hugging Face |
| Modelos RKNN de otros fabricantes para RK1828 | no disponible | no disponible | RKNN | variable | no disponible |

La comparación directa con alternativas RKNN para el mismo chip no está disponible en la información proporcionada. Frente al modelo base, la diferencia clave es el formato y el destino de ejecución (NPU frente a GPU/CPU), no la capacidad cognitiva, que debería ser equivalente salvo por la pérdida de precisión de la cuantización w4a16.

## Limitaciones y advertencias

- Licencia restrictiva: LFM Open License v1.0, no Apache 2.0. Es obligatorio revisar `LICENSE` y `Notice` antes de cualquier uso comercial; la model card advierte explícitamente de esta diferencia.
- Dependencia de hardware: solo funciona en RK1828 con RKNN Runtime v1.1.0 y el driver correspondiente. No es portable a GPU ni a otras NPU sin reconversión.
- Requisito de implementación específico: la inferencia debe soportar `shortconv pads=2`; usar una implementación genérica puede producir resultados incorrectos.
- Cuantización w4a16: la reducción a 4 bits en pesos puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento o generación de código; no se publican evaluaciones que cuantifiquen esta pérdida.
- Idiomas no documentados: no se especifica qué lenguas cubre el modelo, lo que impide garantizar calidad en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación: inherente a los LLM de 1.2B; no hay datos de evaluación que permitan acotarlo.
- Sesgos: no disponible; la model card no documenta sesgos conocidos.
- Verificación de integridad obligatoria: el autor exige ejecutar `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas muestran `OK`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Fecha de creación futura (2026-11-20): conviene verificar la procedencia y vigencia del artefacto antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación de la configuración (inglés): `LFM2.5-1.2B-Instruct-w4a16-8-128000/README.md` dentro del repositorio
- Documentación de la configuración (chino): `LFM2.5-1.2B-Instruct-w4a16-8-128000/README_CN.md` dentro del repositorio
- Licencia: `LICENSE` en la raíz del repositorio
- Aviso legal y atribución: `Notice` en la raíz del repositorio
- Checksums: `LFM2.5-1.2B-Instruct-w4a16-8-128000/SHA256SUMS`
- ModelScope (mismo modelo): búsqueda por `UGREENDEV/RK182X-LLM-LFM2.5-1.2B-Instruct`
