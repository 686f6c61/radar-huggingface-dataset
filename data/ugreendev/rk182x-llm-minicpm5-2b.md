# UGREENDEV/RK182X-LLM-MiniCPM5-2B

## Resumen

RK182X-LLM-MiniCPM5-2B es una conversión al formato RKNN del modelo openbmb/MiniCPM5-2B, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado y empaquetado específicamente para el runtime RKNN v1.1.0, lo que lo convierte en una pieza de despliegue en hardware embebido más que en un modelo de propósito general para GPU.

El repositorio agrupa cinco configuraciones distintas que varían en el esquema de cuantización (w4a16 o w8a16), el número de núcleos NPU utilizados (8 en todos los casos), la longitud de contexto (desde 5632 hasta 48128 tokens) y el formato de la caché KV (fp16 o int4). Esta variedad permite ajustar el equilibrio entre memoria disponible, longitud de contexto y precisión según el chip concreto y la carga de trabajo prevista.

Su relevancia actual radica en que facilita llevar un LLM de 2B parámetros a un SoC con NPU dedicada sin necesidad de adaptar manualmente el grafo ni las capas de atención. El repositorio pesa 5,9 GB e incluye checksums SHA-256 por configuración, lo que simplifica la verificación de integridad antes del despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados en la informacion) |
| Parametros totales | 2B (según nombre del modelo base MiniCPM5-2B) |
| Parametros activos | no aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | 5632, 13312, 14336, 18432 o 48128 tokens según configuración |
| Tipos de cuantizacion | w4a16 y w8a16; caché KV en fp16 o int4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuración |

## Arquitectura y entrenamiento

El modelo subyacente es openbmb/MiniCPM5-2B, un LLM de aproximadamente 2B parámetros del que no se detallan en esta información ni la arquitectura interna (número de capas, dimensiones, tipo de atención) ni el proceso de entrenamiento (tokens, composición del dataset, RLHF/DPO). La model card del repositorio derivado se centra exclusivamente en el empaquetado RKNN y no reproduce la ficha técnica del modelo original.

La innovación técnica de esta publicación no está en el entrenamiento sino en la conversión: cinco configuraciones precompiladas para el runtime RKNN v1.1.0, todas con 8 núcleos NPU, que difieren en cuantización de pesos (w4a16 o w8a16), longitud máxima de contexto y precisión de la caché KV. Las variantes con caché int4 permiten contextos de 13312 y 48128 tokens reduciendo el consumo de memoria, mientras que las variantes fp16 ofrecen mayor fidelidad numérica con contextos menores. Cada configuración incluye su propio config.json, manifiesto de ficheros y sumas SHA-256 para verificación.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta "conversational".
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante runtime RKNN v1.1.0.
- Soporte de contextos largos en las configuraciones de 18432 y 48128 tokens, útil para conversaciones multi-turno o documentos extensos.
- Cuantización de pesos a 4 y 8 bits con activaciones a 16 bits (w4a16, w8a16) para reducir huella de memoria.
- Caché KV cuantizada a int4 en las configuraciones que lo indican, lo que permite contextos mayores con el mismo presupuesto de memoria.
- Compatibilidad declarada con endpoints (tag "endpoints_compatible"), orientada a servir el modelo tras un API.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede desplegarse sobre RK1820 o RK1828 para gestionar diálogos multi-turno localmente, sin depender de la nube, usando la configuración de contexto que encaje con la memoria disponible del dispositivo.
- Procesamiento de documentos largos en el borde: con la configuración de 48128 tokens y caché KV int4, es posible resumir o extraer información de documentos extensos directamente en el SoC, evitando enviar datos sensibles a servidores externos.
- Automatización industrial con requisitos de privacidad: al ejecutarse en NPU local, encaja en líneas de producción o equipos de campo donde no se permite la conectividad externa y se necesita generación de texto o clasificación de incidencias.
- Prototipado rápido en hardware Rockchip: las cinco configuraciones precompiladas permiten comparar latencia y calidad en el mismo chip sin recompilar el modelo, acelerando la elección de la variante adecuada.
- Servicio de inferencia interno con API compatible: gracias a la etiqueta "endpoints_compatible", puede integrarse detrás de un endpoint HTTP en una puerta de enlace local para aplicaciones de oficina o kioscos.
- Evaluación de cuantización en producción: las variantes w4a16 y w8a16 con caché fp16 o int4 permiten medir el impacto real de la cuantización sobre la calidad de las respuestas en el hardware objetivo antes de fijar una configuración definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: RK1820 (configuraciones de 5632 y 13312 tokens) y RK1828 (todas las configuraciones, incluida la de 48128 tokens).
- Runtime: RKNN Runtime v1.1.0 obligatorio, con driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- NPU: 8 núcleos en todas las configuraciones.
- VRAM/RAM estimada: no disponible de forma explícita; el repositorio completo ocupa 5,9 GB, pero cada configuración individual debe consultarse en su subdirectorio.
- GPU: no aplica; el modelo está empaquetado para NPU Rockchip, no para CUDA.
- Cabe en GPU consumer: no disponible; el formato RKNN no es ejecutable en GPU convencionales sin reconversión.
- Opciones de despliegue: runtime RKNN v1.1.0 sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-MiniCPM5-2B (este) | ~2B | 5632-48128 según config | RKNN | apache-2.0 | NPU RK1820/RK1828 |
| openbmb/MiniCPM5-2B | ~2B | no disponible | safetensors (presumible, no confirmado) | no disponible en esta ficha | GPU/CPU genéricas |
| Otros derivados RKNN de LLM | no disponible | no disponible | RKNN | variable | NPU Rockchip |

La comparación directa con alternativas de la misma categoría (LLM de ~2B para hardware embebido) no está disponible en la información proporcionada; el único punto de referencia claro es el modelo base original, del que este repositorio es una conversión cuantizada.

## Limitaciones y advertencias

- El modelo está atado al runtime RKNN v1.1.0 y a los chips RK1820/RK1828; no es portable a GPU NVIDIA, AMD ni a CPU convencionales sin reconversión.
- La cuantización w4a16 y la caché KV int4 pueden degradar la calidad de las respuestas frente al modelo base en fp16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- La configuración de 48128 tokens solo es compatible con RK1828; en RK1820 el máximo es de 13312 tokens (con caché int4) o 5632 tokens (con caché fp16).
- No se documentan los idiomas soportados; la ficha del modelo base no se incluye en esta información, por lo que no puede confirmarse un rendimiento multilingüe equilibrado.
- Riesgo de alucinación inherente a los LLM de 2B parámetros; no se han publicado tasas de error ni evaluaciones de fidelidad.
- La licencia apache-2.0 del modelo base se mantiene, pero se aplican adicionalmente los términos de licencia del RKNN Toolkit y del RKNN Runtime, que deben revisarse antes de un uso comercial.
- Es imprescindible verificar las sumas SHA-256 (`sha256sum -c SHA256SUMS`) antes del despliegue; el autor lo indica explícitamente.
- No se dispone de información sobre sesgos, datos de entrenamiento ni procesos de alineación del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Configuración w4a16, contexto 13312, KV int4: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-2B/tree/main/MiniCPM5-2B-w4a16-8-13312-kv-int4
- Configuración w4a16, contexto 18432, KV fp16: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-2B/tree/main/MiniCPM5-2B-w4a16-8-18432-normal
- Configuración w4a16, contexto 48128, KV int4: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-2B/tree/main/MiniCPM5-2B-w4a16-8-48128-kv-int4
- Configuración w4a16, contexto 5632, KV fp16: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-2B/tree/main/MiniCPM5-2B-w4a16-8-5632
- Configuración w8a16, contexto 14336, KV fp16: https://huggingface.co/UGREENDEV/RK182X-LLM-MiniCPM5-2B/tree/main/MiniCPM5-2B-w8a16-8-14336-normal
- ModelScope (espejo): https://modelscope.cn/models/UGREENDEV/RK182X-LLM-MiniCPM5-2B
