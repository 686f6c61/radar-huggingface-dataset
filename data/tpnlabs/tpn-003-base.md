# tpnlabs/tpn-003-base

## Resumen

TPN-003-base es un repositorio archivado publicado por tpnlabs que no contiene pesos de modelo, sino únicamente metadatos de procedencia del artefacto base utilizado en la competición TPN-003. El repositorio documenta que el modelo original era una conversión a GGUF en precisión BF16 del modelo `lemuralabs/Gemma-4-12B-uncensored-bf16`, un fine-tune no censurado de una hipotética familia Gemma 4 de 12 000 millones de parámetros. El archivo original (`gemma4-12b-uncensored-bf16.gguf`) pesaba 23 832 065 152 bytes (aproximadamente 23,8 GB) y fue retirado de la organización TPN Labs el 23 de noviembre de 2026.

La relevancia de este repositorio es exclusivamente histórica y de verificación: conserva el SHA-256 del artefacto original y el commit exacto del repositorio upstream para permitir la reproducibilidad de la entrada de la competición. No es un modelo desplegable ni utilizable para inferencia, ya que no incluye pesos. Cualquier evaluación práctica debe realizarse sobre el modelo upstream fijado en la revisión indicada.

Dado que el repositorio no contiene tarjetas técnicas detalladas, la mayor parte de las especificaciones de arquitectura, entrenamiento y rendimiento no están disponibles en la información proporcionada y se marcan como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Gemma, sin confirmar) |
| Parámetros totales | 12B (según el nombre del modelo base; no confirmado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (GGUF convertido con llama.cpp); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16); el repositorio actual no contiene pesos |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre del modelo upstream (`Gemma-4-12B-uncensored-bf16`) sugiere una base de la familia Gemma con 12 000 millones de parámetros y un proceso de fine-tuning orientado a eliminar restricciones de censura, pero la model card del repositorio archivado no detalla capas, atención, composición del dataset ni técnicas de alineación (RLHF, DPO u otras).

El único dato técnico verificable es el proceso de conversión: los pesos upstream fueron convertidos a formato GGUF en precisión BF16 mediante `llama.cpp`. El artefacto resultante tenía un tamaño de 23 832 065 152 bytes y un SHA-256 documentado (`99136ed3385c4ae2e097aed4ad743efce699f19017b3e52e17ce09d9f066e6f9`), lo que permite verificar la integridad de cualquier reproducción.

## Capacidades

- No se documentan capacidades específicas en la información proporcionada.
- El nombre del modelo base sugiere generación de texto y un ajuste orientado a reducir restricciones de contenido, pero no hay confirmación técnica en la model card.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Verificación de procedencia de artefactos: el repositorio permite comprobar que un GGUF descargado o regenerado coincide con el SHA-256 archivado, útil en auditorías de competiciones.
- Reproducción de entradas de competición: un participante puede reconstruir el artefacto original partiendo de la revisión fijada del modelo upstream y del proceso de conversión documentado.
- Archivado histórico de linajes de modelos: sirve como registro inmutable de qué modelo exacto se usó en la competición TPN-003 y en qué fecha se retiró.
- Trazabilidad de cadena de custodia: el commit upstream fijado (`20201d2b43d9024f5f1f8bd077155215be9fd0aa`) permite auditar el origen de los pesos.
- Documentación de retiradas: el repositorio explica por qué se eliminó el espejo GGUF y cómo migrar a referencias directas al modelo upstream.
- Integración en pipelines de CI que validen hashes de artefactos antes de permitir su uso en evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; a partir del tamaño del archivo BF16 (aproximadamente 23,8 GB) puede inferirse que la inferencia en BF16 requiere más de 24 GB de VRAM, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `llama.cpp` es la herramienta documentada para la conversión a GGUF; otras opciones (vLLM, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible ejecutar inferencia directamente desde él.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse la licencia del modelo upstream.
- El modelo base se describe como "uncensored", lo que implica un mayor riesgo de generar contenido inapropiado, sesgado o dañino; no se han documentado evaluaciones de seguridad.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de calidad en idiomas distintos del inglés.
- El artefacto original fue retirado el 23 de noviembre de 2026; cualquier dependencia de la URL antigua fallará.
- El nombre "Gemma-4-12B" no está verificado contra una fuente oficial en la información proporcionada; trátese como una etiqueta del autor.
- El repositorio está marcado como `archived`; no se esperan actualizaciones ni soporte.

## Enlaces

- Repositorio archivado: https://huggingface.co/tpnlabs/tpn-003-base
- Modelo upstream: https://huggingface.co/lemuralabs/Gemma-4-12B-uncensored-bf16
- Revisión fijada upstream: https://huggingface.co/lemuralabs/Gemma-4-12B-uncensored-bf16/tree/20201d2b43d9024f5f1f8bd077155215be9fd0aa
- Herramienta de conversión: https://github.com/ggerganov/llama.cpp
