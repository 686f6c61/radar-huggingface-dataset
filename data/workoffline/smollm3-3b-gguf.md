# WorkOffline/SmolLM3-3B-GGUF

## Resumen

SmolLM3-3B-GGUF es un espejo (mirror) del modelo SmolLM3-3B de Hugging Face, publicado por el usuario WorkOffline para que su aplicación homónima pueda descargar los pesos en formato GGUF desde un único punto, fijado a una revisión concreta y verificado mediante SHA-256. No se trata de un modelo nuevo ni de un fine-tuning: los bytes son idénticos a los archivos originales de `ggml-org/SmolLM3-3B-GGUF`, y todo el crédito del modelo corresponde a HuggingFaceTB (autor del modelo base) y a ggml-org (autor de la conversión a GGUF).

El modelo subyacente, SmolLM3-3B, es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Hugging Face, distribuido bajo licencia Apache 2.0. La model card de este repositorio no aporta detalles sobre arquitectura, longitud de contexto ni datos de entrenamiento; esa información debe consultarse en el repositorio del modelo base. Lo relevante de este mirror es su función operativa: garantizar reproducibilidad mediante una revisión fijada y un hash verificable, algo útil en despliegues que necesitan integridad de artefactos.

El repositorio contiene un único archivo cuantizado, `SmolLM3-3B-Q4_K_M.gguf`, de 1.915.305.312 bytes (aproximadamente 1,78 GiB), lo que lo sitúa en el rango de modelos que caben en GPU de consumo con cuantización de 4 bits. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde a SmolLM3-3B de HuggingFaceTB; no se detalla en este repositorio) |
| Parametros totales | 3B (según el nombre del modelo base, SmolLM3-3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no documenta la arquitectura ni el proceso de entrenamiento del modelo. Se trata de una copia sin modificaciones de los archivos GGUF de SmolLM3-3B generados por ggml-org a partir del modelo original de HuggingFaceTB. Cualquier detalle sobre tipo de transformer, número de tokens de entrenamiento, composición del dataset o técnicas de alineación (RLHF/DPO) debe consultarse en la model card del modelo base, que no forma parte de la información disponible en esta ficha.

La única innovación técnica atribuible a este repositorio es de empaquetado y cadena de suministro: fija la revisión upstream `4965cb60b150737b68a0408c36aeefb65078f894` y publica el hash SHA-256 del archivo (`8334b850b7bd46238c16b0c550df2138f0889bf433809008cc17a8b05761863e`) para permitir verificación de integridad en la descarga.

## Capacidades

- Generación de texto: capacidades heredadas del modelo base SmolLM3-3B; no se detallan en este repositorio.
- Razonamiento, código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local: al estar en formato GGUF, es compatible con runtimes de inferencia local basados en llama.cpp.

## Casos de uso

- Despliegue offline en aplicaciones de escritorio: la app WorkOffline descarga este archivo desde un único repositorio con revisión fijada y verificación SHA-256, lo que simplifica la distribución de un modelo de 3B en entornos sin conectividad permanente.
- Verificación de integridad en pipelines de CI/CD: el hash publicado permite comprobar que el artefacto descargado coincide byte a byte con el original antes de empaquetarlo en una release.
- Inferencia local en hardware de consumo: el archivo Q4_K_M de ~1,78 GiB puede cargarse en GPUs con 4-6 GB de VRAM o ejecutarse en CPU mediante llama.cpp, adecuado para prototipos y demos.
- Espejo de disponibilidad: sirve como copia de respaldo si el repositorio upstream de GGUF no estuviera accesible, manteniendo una revisión concreta congelada.
- Reproducibilidad de experimentos: al fijar la revisión upstream, investigadores pueden referenciar un artefacto exacto en publicaciones o evaluaciones comparativas.
- Integración en herramientas tipo Ollama o LM Studio: el formato GGUF es directamente importable en estos gestores de modelos locales para asistentes de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con la cuantización Q4_K_M incluida (archivo de ~1,78 GiB más overhead de contexto y caché KV).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar el modelo.
- GPU de consumo: sí, cabe en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en ejecución por CPU.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros). vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B (HuggingFaceTB) | 3B | no disponible | Apache 2.0 | safetensors y otros | Hugging Face |
| SmolLM3-3B-GGUF (ggml-org) | 3B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| SmolLM3-3B-GGUF (WorkOffline, este repo) | 3B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | Hugging Face, revisión fijada y SHA-256 |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La diferencia entre este repositorio y el de ggml-org es exclusivamente operativa (espejo, revisión fijada, verificación de hash y nombre de archivo), no de pesos ni de comportamiento del modelo.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos a los de SmolLM3-3B; cualquier limitación del modelo base aplica sin cambios.
- Sesgos conocidos: no disponible en la información proporcionada; deben consultarse en la model card del modelo base.
- Riesgo de alucinación: no cuantificado en este repositorio; es un modelo de 3B, por lo que cabe esperar una fiabilidad inferior a la de modelos de mayor tamaño en tareas de razonamiento complejo.
- Limitaciones de contexto e idioma: no disponibles; el repositorio no declara idiomas soportados ni longitud de contexto.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio advierte de que el modelo base declara la licencia sin incluir un archivo LICENSE propio; el archivo incluido aquí es el texto estándar de Apache 2.0.
- Solo se ofrece una cuantización (Q4_K_M): no hay variantes Q5, Q8 ni FP16 en este repositorio, lo que limita el ajuste fino entre calidad y tamaño.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta; no hay garantía de mantenimiento o actualización por parte del mirror.
- Para producción, conviene validar el hash SHA-256 tras la descarga y considerar el repositorio upstream de ggml-org como fuente primaria.

## Enlaces

- Repositorio de este mirror: https://huggingface.co/WorkOffline/SmolLM3-3B-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- GGUF upstream: https://huggingface.co/ggml-org/SmolLM3-3B-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
