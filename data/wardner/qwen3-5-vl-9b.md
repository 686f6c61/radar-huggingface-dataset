# wardner/Qwen3.5-VL-9B

## Resumen

Qwen3.5-VL-9B es un artefacto de despliegue para hardware de borde publicado por el usuario wardner en Hugging Face, derivado del modelo multimodal Qwen3.5-9B de Alibaba Qwen. No se trata de los pesos originales en safetensors, sino de una conversión a formato RKNN y RKLLM destinada a ejecutarse sobre dos tarjetas coprocesadoras Rockchip RK182x con un host RK3588. El repositorio incluye los grafos RKNN, los ficheros de pesos asociados, la tabla de embeddings en fp16, el tokenizador en GGUF y un manifiesto de worker (`qwen3.5-vl-9b.json`) que describe cómo cargarlo en el runtime wdnwebui.

El modelo cubre tres capacidades declaradas: chat de texto, chat con visión y tool calling. La distribución está segmentada en dos mitades (`seg0` y `seg1`) que deben residir simultáneamente en las dos tarjetas RK182x, con un peso total de 6,87 GB y una estimación de memoria de unos 7000 MB. El tiempo de inicialización declarado es de aproximadamente 60 segundos.

Su relevancia es acotada pero específica: permite llevar un VLM de 9B parámetros a una plataforma embebida Rockchip con aceleración NPU, algo que los formatos estándar (safetensors, GGUF) no permiten directamente en ese hardware. La licencia Apache 2.0 del modelo upstream se mantiene, aunque los ficheros publicados son derivados convertidos, no los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B, multimodal texto+visión; artefactos en grafos RKNN segmentados) |
| Parametros totales | 9B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos empaquetados para RKNN; embeddings en fp16) |
| Idiomas soportados | no disponible (la model card está en inglés y chino simplificado, sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (grafos `.rknn`) + ficheros `.weight` propietarios de RKLLM, embeddings `.embed.bin` en fp16, tokenizador `.tokenizer.gguf` |
| Tamano total de pesos | 6,87 GB |
| Memoria estimada en runtime | ~7000 MB |
| Tarjetas requeridas | 2 x Rockchip RK182x |
| Host | RK3588 |
| Runtime | RKLLM + RKNN (wdnwebui) |
| Tiempo de inicializacion | ~60 s |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base Qwen3.5-9B en la documentación proporcionada. La model card del repositorio de wardner describe exclusivamente el empaquetado para despliegue, no el diseño del modelo.

Lo que sí se documenta es la estructura del artefacto: el modelo se divide en dos segmentos (`seg0` con 2307,4 MB de pesos y `seg1` con 2395,6 MB), cada uno con su grafo RKNN de 48,8 MB y 42,5 MB respectivamente, pensados para ejecutarse en paralelo sobre dos tarjetas RK182x (generación de 1,82 TOPS). El componente de visión ocupa 286,4 MB de pesos más un grafo de 6,9 MB. La tabla de embeddings se distribuye aparte en fp16 (1940,0 MB) y el tokenizador es un GGUF de 10,4 MB con BPE estilo GPT-2 y ByteLevel. No se detalla si el modelo base emplea atención lineal, decodificación especulativa u otras innovaciones.

## Capacidades

- Generación de texto conversacional (`swcap_text_chat`).
- Comprensión de imágenes y diálogo multimodal (`swcap_vision_chat`).
- Llamada a herramientas / function calling (`swcap_tool_call`).
- Ejecución en hardware de borde Rockchip RK182x con host RK3588.
- Integración con el runtime wdnwebui mediante manifiesto de worker (`qwen3_5_vl_9b`).
- Soporte de verificación de integridad mediante SHA-256 (`SHA256SUMS`).
- No se documentan capacidades de audio, thinking mode explícito ni otros modos especiales.

## Casos de uso

- Visión artificial en dispositivos embebidos: el modelo puede procesar imágenes y responder en lenguaje natural directamente sobre un host RK3588 con dos tarjetas RK182x, sin depender de la nube. Es adecuado para inspección visual en línea de producción o robótica de borde.
- Asistente conversacional local con contexto visual: en quioscos, paneles industriales o terminales de atención presencial, el modelo gestiona diálogo multi-turno combinando texto e imagen, con una inicialización de ~60 s que permite dejarlo residente.
- Automatización con tool calling en entornos aislados: al soportar `swcap_tool_call`, puede orquestar acciones sobre sistemas locales (bases de datos, actuadores, APIs internas) sin conexión a internet, útil en entornos OT o instalaciones sin red.
- Digitalización documental en el dispositivo: extracción de información de facturas, albaranes o formularios capturados con cámara y conversión a texto estructurado mediante el canal de visión y el chat de texto.
- Control de calidad con descripciones en lenguaje natural: dado que el modelo reside en el propio equipo, puede generar informes descriptivos de defectos detectados en imágenes sin enviar datos fuera de la planta.
- Prototipado de producto de borde: el manifiesto `qwen3.5-vl-9b.json` y la integración con wdnwebui permiten desplegar y validar rápidamente un VLM de 9B en un prototipo basado en RK3588 antes de industrializar la solución.
- Accesibilidad asistida por cámara: aplicación de escritorio o terminal que describe el entorno a partir de la cámara en tiempo real, ejecutándose íntegramente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada en runtime: ~7000 MB según el manifiesto del worker.
- Tarjetas necesarias: 2 x Rockchip RK182x (obligatorio, el modelo es de dos segmentos y ocupa ambas).
- Host: Rockchip RK3588.
- No cabe en GPU de consumo convencional (RTX 4090, etc.) en este formato: los artefactos son RKNN/RKLLM específicos para NPU Rockchip.
- Opciones de despliegue: runtime RKLLM + RKNN a través de wdnwebui; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos ficheros.
- Tiempo de inicialización: ~60 s.
- Latencia y throughput: no disponibles.
- Almacenamiento: 7,4 GB de repositorio (6,87 GB de pesos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| wardner/Qwen3.5-VL-9B | 9B | no disponible | RKNN + RKLLM | RK3588 + 2x RK182x | Apache 2.0 |
| Qwen/Qwen3.5-9B (upstream) | 9B | no disponible | no disponible | GPU convencional | no disponible en la información |
| Alternativas de borde comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo upstream Qwen3.5-9B, del que únicamente se conoce la referencia en Hugging Face y el tamaño nominal. No se dispone de datos de rendimiento, contexto ni licencia del upstream en esta búsqueda, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio contiene derivados convertidos a RKNN, no los pesos originales del modelo Qwen3.5-9B; no son intercambiables con el modelo upstream.
- Requiere obligatoriamente dos tarjetas RK182x y un host RK3588: no es desplegable en GPU estándar ni en CPU.
- El runtime es RKLLM + RKNN con wdnwebui; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers.
- No se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantización, lo que dificulta evaluar su idoneidad para casos concretos.
- No hay benchmarks publicados ni métricas de calidad, latencia o throughput; el rendimiento real es desconocido.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad multimodal.
- No se detallan sesgos conocidos ni evaluaciones de seguridad del modelo base.
- La licencia Apache 2.0 se hereda del modelo upstream, pero los artefactos publicados son derivados; conviene revisar `LICENSE` y `NOTICE` antes de uso comercial.
- El repositorio tiene 36 descargas y 0 likes en el momento de la consulta, con muy poca validación comunitaria.
- La model card está en chino e inglés; no hay documentación en castellano.
- Se recomienda verificar `SHA256SUMS` antes del despliegue, tal como indica el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wardner/Qwen3.5-VL-9B
- Modelo upstream Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
