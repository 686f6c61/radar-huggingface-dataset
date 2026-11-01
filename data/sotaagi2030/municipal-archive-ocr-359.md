# SOTAagi2030/Municipal-Archive-OCR-359

## Resumen

Municipal-Archive-OCR-359 es un modelo de OCR (reconocimiento óptico de caracteres) publicado en HuggingFace por el usuario SOTAagi2030 bajo el identificador de pipeline `image-to-text`. Según su model card, se trata de un modelo "compacto" orientado a la digitalización de fondos documentales de archivos municipales, con una build promocionada denominada PINE-22 y una release fechada en septiembre de 2026 (`archive-ocr-2026-09`).

La información publicada es extremadamente escasa. El autor declara que el modelo fue evaluado sobre 3 colecciones de archivo, con un CER (character error rate) en la peor colección de 161 milésimas (es decir, 0,161) y una latencia de referencia sumada de 204 ms. También indica que la revisión de promoción cubrió 10 builds, de las cuales 3 superaron todas las puertas de calidad y 7 fueron rechazadas, lo que sugiere un proceso interno de validación por umbrales.

No se especifican arquitectura, número de parámetros, longitud de contexto, idiomas soportados ni composición del dataset de entrenamiento. El repositorio tiene un tamaño de 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la medición no los refleja. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta interna `compact-ocr-v2`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La única referencia técnica es la etiqueta `compact-ocr-v2`, que sugiere una familia de modelos OCR compactos, presumiblemente un encoder visual seguido de un decoder de texto (image-to-text), pero no se confirma ni el tipo de backbone, ni el mecanismo de atención, ni si emplea un tokenizer específico para documentos históricos.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, la composición del corpus, ni si hubo etapas de ajuste supervisado, RLHF o DPO (poco habituales en OCR). La model card menciona una evaluación sobre 3 colecciones de archivo y un proceso de promoción con 10 builds candidatas, de las que 3 pasaron todos los umbrales, lo que apunta a un pipeline de validación por métricas (CER y latencia) más que a una descripción de arquitectura o datos.

## Capacidades

- Conversión de imagen a texto (OCR) sobre documentos escaneados, según el pipeline declarado `image-to-text`.
- Orientación específica a fondos de archivo municipal, lo que sugiere tolerancia a documentos administrativos históricos, aunque no se detalla el rango temporal ni la tipología documental cubierta.
- No se declara soporte de tool calling ni function calling.
- No se declara capacidad de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe; los idiomas no están disponibles en la información publicada.
- No se declaran modos especiales (thinking, visión general, audio).

## Casos de uso

- Digitalización de actas municipales: el modelo puede transcribir actas escaneadas de archivos municipales a texto plano para su indexación posterior, aprovechando su ajuste declarado sobre colecciones de archivo.
- Extracción de texto en expedientes administrativos: útil para pipelines de gestión documental que necesiten convertir PDFs escaneados en texto buscable, con la ventaja de una latencia de referencia baja (204 ms sumados según el autor).
- Alimentación de motores de búsqueda internos: la transcripción OCR permite construir índices full-text sobre fondos históricos sin intervención manual masiva.
- Preservación digital y difusión cultural: generación de versiones texto de documentos para portales de archivo abierto, con la licencia Apache 2.0 facilitando su integración en proyectos institucionales.
- Preprocesado para NLP histórica: servir como primera etapa de un pipeline que después aplique NER, resumen o clasificación sobre el texto extraído de documentos municipales.
- Control de calidad en procesos de digitalización masiva: uso del CER declarado (0,161 en la peor colección) como referencia para decidir qué lotes requieren revisión humana antes de publicarse.

## Benchmarks y rendimiento

| Métrica | Valor declarado |
|---|---|
| CER en la peor de 3 colecciones | 0,161 (161 milésimas) |
| Latencia de referencia sumada | 204 ms |
| Builds evaluadas en promoción | 10 |
| Builds que superaron todos los umbrales | 3 |
| Builds rechazadas | 7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos OCR de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declaran parámetros ni tamaño de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se especifican; al usar safetensors, sería compatible con frameworks de inferencia estándar (por ejemplo, Transformers), pero no se confirma.
- Latencia y throughput: el autor declara 204 ms de latencia de referencia sumada, sin especificar hardware ni lote.

## Comparativa con modelos similares

No disponible. La información publicada no permite identificar modelos comparables de la misma categoría (OCR compacto para archivos) ni ofrece datos suficientes de parámetros, contexto o rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card es muy escueta: no hay información sobre arquitectura, datos de entrenamiento ni sesgos conocidos.
- El CER de 0,161 en la peor colección implica que aproximadamente 1 de cada 6 caracteres puede ser erróneo en ese escenario, lo que exige revisión humana en usos críticos.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe ni siquiera monolingüe concreta.
- El tamaño del repositorio (0,0 GB) es inconsistente con la presencia de pesos safetensors; conviene verificar la integridad de los ficheros antes de usarlo en producción.
- Riesgo de alucinación y de errores sistemáticos en tipografías históricas, sellos o manuscritos no documentados.
- La licencia Apache 2.0 permite uso comercial, pero al no haber información sobre procedencia de los datos de entrenamiento no puede descartarse riesgo de sesgos o de derechos sobre el corpus.
- No hay evidencia de soporte de tool calling, agentes ni integración con pipelines complejos más allá de la inferencia image-to-text.

## Enlaces

- HuggingFace: https://huggingface.co/SOTAagi2030/Municipal-Archive-OCR-359
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
