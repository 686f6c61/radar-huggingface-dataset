# UGREENDEV/RK1828-VLM-Mage-VL

## Resumen

RK1828-VLM-Mage-VL es una conversión al formato RKNN del modelo vision-language microsoft/Mage-VL, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del modelo base de Microsoft orientada a despliegue en hardware embebido, con runtime RKNN v1.1.0 y kernels optimizados para los núcleos NPU del chip.

El paquete incluye una única configuración publicada, Mage-VL-384x384-w4a16-8-15360, que fija la entrada de visión a 384x384 píxeles, cuantiza tanto el codificador visual como el LLM a w4a16 (pesos de 4 bits, activaciones de 16 bits) y asigna 8 núcleos NPU a cada componente. La longitud de contexto del LLM es de 15.360 tokens con KVCache en fp16.

Su relevancia es acotada pero específica: permite ejecutar un VLM conversacional (image-text-to-text) en un SoC con NPU integrada, algo que los pesos originales en safetensors no permiten sin conversión previa. El repositorio ocupa 3,5 GB y se distribuye bajo Apache 2.0, heredando la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base microsoft/Mage-VL; empaquetado como RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 15.360 tokens (LLM) |
| Tipos de cuantizacion | w4a16 en visión y LLM; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0); no incluye safetensors ni GGUF del modelo base |
| Resolucion de vision | 384x384 |
| Nucleos NPU | 8 (visión) + 8 (LLM) |
| Chips soportados | RK1828 |
| Version de runtime | RKNN Runtime v1.1.0 |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de identificarlo como un VLM de tipo image-text-to-text. La información disponible se limita al proceso de conversión: codificador visual y LLM cuantizados a w4a16, entrada visual fijada a 384x384 y despliegue sobre 8 núcleos NPU por componente. No se especifican número de parámetros, composición del dataset de entrenamiento, tokens vistos, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento.

La innovación técnica del paquete es el propio pipeline de conversión a RKNN con runtime v1.1.0, que habilita inferencia en NPU Rockchip con verificación de integridad mediante SHA-256 y un manifiesto de ficheros en config.json. No hay datos publicados sobre decodificación especulativa, atención lineal ni otras optimizaciones algorítmicas.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), según el pipeline declarado.
- Conversación multi-turno: el repositorio incluye la etiqueta `conversational` y compatibilidad con endpoints.
- Procesamiento de imágenes a resolución 384x384.
- Ventana de contexto de 15.360 tokens para el LLM, suficiente para conversaciones con varias imágenes o documentos extensos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Inspección visual en dispositivos embebidos: el modelo puede recibir una imagen de 384x384 capturada por una cámara integrada y generar una descripción o respuesta en lenguaje natural directamente en la NPU RK1828, sin necesidad de un servidor externo.
- Asistencia en el borde para electrodomésticos y dispositivos de consumo: al ejecutarse sobre un SoC Rockchip con 8 núcleos NPU, encaja en productos donde no es viable enviar imágenes a la nube por latencia, coste o privacidad.
- Digitalización de documentos y tickets: con 15.360 tokens de contexto, puede procesar una imagen de documento y mantener una conversación de seguimiento sobre su contenido en una sola sesión.
- Control de calidad visual en línea de producción: integrado en una cadena de captura industrial, el modelo puede clasificar o describir defectos visibles en lotes de imágenes de forma local.
- Accesibilidad: descripción de escenas para usuarios con discapacidad visual en dispositivos portátiles que incorporen el chip RK1828, con la ventaja de no requerir conectividad.
- Prototipado de producto VLM: sirve como referencia de despliegue para equipos que quieran validar un pipeline image-text-to-text sobre RKNN antes de entrenar o adaptar su propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de latencia o throughput.

## Requisitos de hardware

- Hardware objetivo: NPU Rockchip RK1828 exclusivamente. No se soportan otras chips según la model card.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU del SoC, no sobre GPU dedicada. El repositorio ocupa 3,5 GB en disco.
- GPU recomendadas: no disponible; el formato RKNN no es ejecutable en A100, H100 ni RTX 4090 sin reconversión.
- Compatibilidad con GPU de consumo: no; requiere el runtime RKNN y el driver correspondiente.
- Despliegue: RKNN Runtime v1.1.0 con driver compatible. Es obligatorio verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Verificación de integridad: ejecutar `sha256sum -c SHA256SUMS` en el directorio de configuración y desplegar solo si todas las entradas devuelven OK.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Hardware | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| RK1828-VLM-Mage-VL | RKNN | NPU RK1828 | 15.360 tokens | w4a16 | Apache 2.0 |
| microsoft/Mage-VL (base) | safetensors (presumible) | GPU | no disponible | no disponible | Apache 2.0 |
| Alternativas VLM para NPU Rockchip | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros VLM de propósito general no es significativa: este paquete está atado a un chip concreto y no compite en el mismo eje que modelos desplegables en GPU. Frente al modelo base, la diferencia es de formato y cuantización, no de capacidades declaradas.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en RK1828 con RKNN Runtime v1.1.0 y driver compatible; no es portable a GPU ni a CPU convencional.
- Resolución visual fija de 384x384, lo que limita la lectura de texto pequeño o detalles finos en imágenes de alta resolución.
- Cuantización w4a16: degradación de precisión esperable respecto al modelo base en tareas de razonamiento visual o generación de texto largo; el autor no publica evaluación comparativa.
- Idiomas no declarados: no hay garantía de calidad multilingüe ni de soporte del castellano.
- Riesgo de alucinación: inherente a los VLM; no se documentan mitigaciones ni evaluaciones de fidelidad.
- Sesgos: no disponibles; el autor no publica análisis de sesgo.
- Licencia: Apache 2.0 para el paquete, pero el uso queda también sujeto a las condiciones del modelo base, del RKNN Toolkit y del RKNN Runtime, según el fichero Notice.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar versiones puede producir fallos silenciosos.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-Mage-VL
- Modelo base: https://huggingface.co/microsoft/Mage-VL
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-VLM-Mage-VL --revision master`
- Documentación de la configuración: `Mage-VL-384x384-w4a16-8-15360/README.md` (incluida en el repositorio)
- Paper, blog o demo del autor: no disponible
