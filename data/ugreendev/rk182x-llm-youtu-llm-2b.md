# UGREENDEV/RK182X-LLM-Youtu-LLM-2B

## Resumen

RK182X-LLM-Youtu-LLM-2B es una conversión del modelo de lenguaje Youtu-LLM-2B, desarrollado originalmente por Tencent-YouTu-Research, a formato RKNN para su despliegue sobre el SoC Rockchip RK1828. El artefacto lo publica UGREENDEV y su propósito no es servir como modelo de propósito general en GPU, sino como binario optimizado para inferencia en el acelerador NPU integrado en hardware Rockchip de gama embebida.

El modelo base es un LLM de aproximadamente 2 mil millones de parámetros, orientado a generación de texto conversacional. La conversión aplica cuantización de pesos en 4 bits con activaciones en 16 bits (w4a16), distribuida sobre 8 núcleos NPU del RK1828, y mantiene una caché KV en fp16 con una ventana de contexto de 11264 tokens (11k). El repositorio ocupa 1,8 GB e incluye los pesos RKNN, configuraciones, sumas de verificación SHA-256 y los textos de licencia.

Su relevancia actual reside en la posibilidad de ejecutar un LLM de 2B con contexto largo directamente sobre silicio Rockchip sin GPU dedicada, lo que abre escenarios de inferencia local en dispositivos de borde, pasarelas y equipos integrados. Es un artefacto de despliegue, no un modelo entrenado desde cero: cualquier evaluación de calidad debe remitirse al modelo original Youtu-LLM-2B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Youtu-LLM-2B de Tencent-YouTu-Research; formato de despliegue RKNN) |
| Parámetros totales | no disponible con cifra exacta; el nombre indica ~2B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 11264 tokens (11k) |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (Youtu-LLM License, según la model card) |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio también etiquetado como gguf |
| Núcleos NPU | 8 |
| Chips soportados | RK1828 |
| Versión de runtime RKNN | v1.1.0 |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Youtu-LLM-2B en la documentación proporcionada: no se detalla si emplea transformer denso, atención lineal, mezcla de expertos ni otras variantes. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. La model card de este repositorio se limita a describir el proceso de conversión y despliegue.

La innovación técnica documentada aquí es de naturaleza de despliegue, no de modelado: la conversión a RKNN con cuantización w4a16 y reparto sobre 8 núcleos NPU del RK1828, junto con una caché KV en fp16 que sostiene una ventana de 11264 tokens. El repositorio incluye sumas SHA-256 para verificar la integridad de los ficheros antes del despliegue, lo que sugiere un pipeline de publicación orientado a producción embebida.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation, etiqueta conversational).
- Conversación multi-turno dentro de la ventana de 11264 tokens.
- Inferencia sobre NPU Rockchip RK1828 mediante runtime RKNN v1.1.0.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: al ejecutarse sobre el NPU del RK1828 sin GPU dedicada, el modelo puede sostener diálogos multi-turno en equipos integrados, pasarelas domésticas o terminales industriales con una ventana de 11k tokens.
- Pasarelas de atención al cliente en hardware empotrado: la ventana de 11264 tokens permite mantener historial de conversación y contexto de producto dentro de un equipo de bajo consumo, sin depender de un servidor central.
- Procesamiento local de texto en entornos con requisitos de privacidad: al residir íntegramente en el dispositivo (1,8 GB de pesos), los datos no salen del equipo, lo que encaja en escenarios regulados o aislados de red.
- Automatización de documentación y resúmenes en campo: resumen de partes de trabajo, actas o notas técnicas capturadas en dispositivos portátiles basados en Rockchip.
- Integración en pipelines de CI/CD para verificación del artefacto: las sumas SHA-256 incluidas permiten automatizar la comprobación de integridad antes de desplegar el modelo en flotas de dispositivos.
- Prototipado de productos de IA embebida: sirve como base para validar latencia, consumo y calidad conversacional sobre RK1828 antes de comprometerse con hardware dedicado.
- Sustitución de servicios en la nube en entornos de conectividad intermitente: inferencia totalmente offline sobre el SoC, útil en instalaciones remotas o móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional; el modelo se ejecuta sobre la NPU del SoC RK1828, no sobre VRAM de GPU.
- GPU recomendadas: no disponible; el artefacto está destinado exclusivamente a chips RK1828.
- Compatibilidad con GPU de consumo: no disponible; el formato RKNN no está pensado para RTX 4090 u otras GPU de consumo.
- Chips soportados: RK1828 exclusivamente, con 8 núcleos NPU.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Opciones de despliegue: runtime RKNN sobre RK1828. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Tamaño en disco: 1,8 GB para el repositorio completo; los pesos deben usarse conjuntamente desde el directorio de configuración `Youtu-LLM-2B-w4a16-8-11264`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-LLM-Youtu-LLM-2B (este) | ~2B (cifra exacta no disponible) | 11264 tokens | w4a16, KVCache fp16 | Youtu-LLM License (other) | Hugging Face y ModelScope, formato RKNN para RK1828 |
| Youtu-LLM-2B (modelo base) | ~2B (cifra exacta no disponible) | no disponible | no disponible | Youtu-LLM License | ModelScope (Tencent-YouTu-Research) |
| Alternativas de 2B para GPU/CPU | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de propósito general de tamaño similar no es significativa en este caso, porque el artefacto está restringido al silicio RK1828 y no compite en el mismo sustrato de ejecución. La referencia válida es el modelo base Youtu-LLM-2B, del que este repositorio es una conversión.

## Limitaciones y advertencias

- Restricción de hardware total: solo funciona en chips RK1828; no es desplegable en GPU, CPU convencional ni otros SoC.
- Dependencia de versión: requiere RKNN Runtime v1.1.0 y el driver correspondiente; discrepancias de versión pueden impedir la ejecución.
- Licencia: el modelo se distribuye bajo Youtu-LLM License (etiqueta "other"), con términos adicionales del RKNN Toolkit y RKNN Runtime; es imprescindible revisar `LICENSE` y `Notice` antes de cualquier uso comercial.
- Idiomas: no se documenta cobertura lingüística; no se puede asumir soporte multilingüe.
- Sesgos y alucinación: no hay información publicada sobre sesgos conocidos ni sobre tasas de alucinación del modelo base.
- Benchmarks: no hay resultados publicados, por lo que la calidad real de salida no está cuantificada en esta ficha.
- Integridad: el despliegue debe hacerse solo tras verificar todas las entradas de `SHA256SUMS` como `OK`.
- Uso de ficheros: deben emplearse conjuntamente los archivos del directorio de configuración seleccionado; mezclar configuraciones distintas puede producir fallos.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Youtu-LLM-2B
- Modelo base en ModelScope: https://modelscope.cn/models/Tencent-YouTu-Research/Youtu-LLM-2B
- Descarga vía ModelScope CLI: `modelscope download --model UGREENDEV/RK182X-LLM-Youtu-LLM-2B --revision master --local_dir ./RK182X-LLM-Youtu-LLM-2B`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-LLM-Youtu-LLM-2B --revision v1.1.0 --local-dir ./RK182X-LLM-Youtu-LLM-2B`
- Documentación de configuración (inglés): `Youtu-LLM-2B-w4a16-8-11264/README.md`
- Documentación de configuración (chino): `Youtu-LLM-2B-w4a16-8-11264/README_CN.md`
- Verificación de integridad: `sha256sum -c SHA256SUMS` dentro del directorio de configuración
