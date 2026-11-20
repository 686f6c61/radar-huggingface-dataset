# UGREENDEV/RK182X-LLM-MiniCPM5-1B

## Resumen

RK182X-LLM-MiniCPM5-1B es una conversión al formato RKNN del modelo openbmb/MiniCPM5-1B, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado (w4a16) del MiniCPM5-1B original, empaquetado junto con el runtime RKNN v1.1.0 y los ficheros de configuración necesarios para desplegarlo en hardware embebido. El repositorio ocupa aproximadamente 1 GB.

El interés de esta ficha radica en que ejemplifica el patrón de despliegue de LLMs en aceleradores de borde: un modelo de ~1B parámetros convertido a una representación de 4 bits para pesos y 16 bits para activaciones, con una ventana de contexto de 8192 tokens y caché KV en fp16, distribuido sobre 8 núcleos NPU. Es un artefacto pensado para integración en dispositivos con recursos limitados, no para servir en GPU de centro de datos.

La información pública disponible es limitada: la model card describe el empaquetado, los comandos de descarga y los requisitos de compatibilidad, pero no detalla el proceso de conversión, los datos de entrenamiento del modelo base ni resultados de evaluación. Todo lo que sigue se limita a lo declarado por el autor y a lo que puede inferirse del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de openbmb/MiniCPM5-1B; la model card no detalla la arquitectura del modelo base) |
| Parametros totales | no disponible (el nombre del modelo base indica ~1B) |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repositorio incluye también tags GGUF, aunque la configuración publicada es RKNN |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base MiniCPM5-1B ni su proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo fases de RLHF o DPO. Lo único documentado es el resultado de la conversión: una configuración denominada `MiniCPM5-1B-w4a16-8-8192`, con cuantización de pesos a 4 bits, activaciones a 16 bits, caché KV en fp16 y reparto sobre 8 núcleos NPU. El runtime RKNN empleado es la versión v1.1.0.

La innovación técnica relevante aquí no está en el modelo, sino en el pipeline de despliegue: la conversión a RKNN permite ejecutar un transformer de ~1B parámetros en silicio Rockchip con un presupuesto de memoria muy ajustado, a costa de fijar la ventana de contexto en 8192 tokens y de requerir que runtime y driver del dispositivo coincidan exactamente con la versión declarada. El repositorio incluye sumas de verificación SHA-256 para garantizar la integridad de los ficheros antes del despliegue.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento y respuesta multi-turno dentro de una ventana de 8192 tokens.
- Ejecución sobre NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere integración con APIs de servicio estándar.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo cabe en el presupuesto de memoria de una NPU RK1820/RK1828 y mantiene 8192 tokens de contexto, suficiente para diálogos multi-turno con historial moderado sin salir del dispositivo.
- Procesamiento de texto local con requisitos de privacidad: al ejecutarse íntegramente en la NPU del equipo, los datos no abandonan el dispositivo, lo que encaja en entornos con restricciones de confidencialidad.
- Clasificación y extracción de información en flujos embebidos: resúmenes, etiquetado y extracción de campos sobre documentos cortos que quepan en la ventana de contexto.
- Integración en productos de electrónica de consumo: el empaquetado RKNN con checksums y runtime versionado facilita la inclusión del modelo en imágenes de firmware reproducibles.
- Prototipado de aplicaciones LLM en hardware Rockchip: sirve como referencia para validar latencia y consumo antes de invertir en modelos mayores o en GPUs.
- Puerta de enlace con API compatible: la etiqueta `endpoints_compatible` permite exponer el modelo tras una interfaz HTTP estándar y reutilizar clientes existentes.
- Verificación de integridad en pipelines de despliegue: el fichero `SHA256SUMS` permite automatizar la validación de artefactos antes de flashear el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU compatible: Rockchip RK1820 o RK1828, con 8 núcleos NPU asignados a esta configuración.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa ~1 GB y la configuración usa pesos de 4 bits con KVCache en fp16 para 8192 tokens.
- GPU de escritorio: no aplica; el artefacto está empaquetado para NPU Rockchip, no para CUDA.
- Opciones de despliegue: RKNN Runtime sobre el hardware objetivo; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-LLM-MiniCPM5-1B (este) | ~1B (no confirmado) | 8192 | RKNN, NPU RK1820/RK1828 | Apache 2.0 + términos RKNN | Hugging Face y ModelScope |
| openbmb/MiniCPM5-1B | ~1B (no confirmado) | no disponible | safetensors (modelo base) | Apache 2.0 | Hugging Face |
| Alternativas de ~1B en formato GGUF para CPU/GPU | no disponible | no disponible | GGUF | variable | no disponible |

La comparación relevante es contra el propio modelo base: este repositorio no añade capacidades nuevas, sino que restringe el destino de ejecución a NPU Rockchip y fija el contexto en 8192 tokens. Frente a alternativas de tamaño similar en formato GGUF, la diferencia principal es el backend de ejecución, no el modelo.

## Limitaciones y advertencias

- Es un derivado cuantizado a 4 bits: cabe esperar una degradación de calidad respecto al MiniCPM5-1B original, aunque no se publican métricas que la cuantifiquen.
- La ventana de contexto está fijada en 8192 tokens; no se documenta soporte para extensiones.
- Requiere coincidencia exacta entre la versión de RKNN Runtime, el driver del dispositivo y los ficheros de la configuración; mezclar versiones o ficheros de directorios distintos puede producir fallos.
- Solo funciona en RK1820 y RK1828; no es portable a otras NPU ni a GPU.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La licencia Apache 2.0 del modelo base se mantiene, pero se aplican adicionalmente los términos de licencia de RKNN Toolkit y RKNN Runtime, que deben revisarse para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-1B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Documentación de la configuración: `MiniCPM5-1B-w4a16-8-8192/README.md` dentro del repositorio
- Ficheros de licencia y atribución: `LICENSE` y `Notice` en la raíz del repositorio
- Sumas de verificación: `MiniCPM5-1B-w4a16-8-8192/SHA256SUMS`
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-MiniCPM5-1B`
