# UGREENDEV/RK182X-VIT-vit-base-patch16-224

## Resumen

RK182X-VIT-vit-base-patch16-224 es una conversión al formato RKNN del modelo de clasificación de imágenes google/vit-base-patch16-224, publicada por el usuario UGREENDEV. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado y cuantizado, pensado para ejecutarse sobre las NPU de los chips Rockchip RK1820 y RK1828 mediante el runtime RKNN v1.1.0. Su propósito es llevar la arquitectura Vision Transformer base de Google a hardware embebido de bajo consumo, manteniendo la tarea original de clasificación de imágenes a 224x224 píxeles.

El modelo hereda la arquitectura del ViT-Base original: un transformer de 12 capas con parches de 16x16, entrenado para clasificación sobre ImageNet-1k (1000 clases). La conversión aplica cuantización de pesos a 4 bits y activaciones a 16 bits (w4a16), distribuida en 8 núcleos NPU, lo que reduce de forma sustancial el peso del modelo respecto a los pesos originales en FP32. El repositorio ocupa aproximadamente 0,1 GB.

Su relevancia es acotada pero concreta: permite desplegar un ViT clásico en dispositivos Rockchip sin necesidad de reentrenar ni reconvertir manualmente, algo útil para proyectos de visión embebida que necesitan clasificación de imágenes en el borde. No aporta innovaciones algorítmicas; su valor está en el empaquetado, la verificación SHA-256 y la compatibilidad declarada con un runtime y unos chips específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224x224) |
| Parámetros totales | no disponible (heredados de google/vit-base-patch16-224, aproximadamente 86 M según el modelo base; no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo fuente) |
| Formato de pesos | RKNN (runtime v1.1.0) |
| Chips soportados | RK1820, RK1828 |
| Núcleos NPU | 8 |
| Resolución de entrada | 224x224 |
| Tamaño del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de google/vit-base-patch16-224: un transformer encoder de 12 capas que divide la imagen en parches de 16x16, los proyecta linealmente y aplica autoatención sobre la secuencia resultante, con una cabeza de clasificación sobre 1000 clases de ImageNet-1k. El modelo original fue preentrenado en un corpus de imágenes a gran escala y ajustado para clasificación, aunque los detalles exactos de datos, número de tokens de imagen y procedimiento de ajuste no se recogen en la información proporcionada.

Esta publicación no documenta entrenamiento adicional ni ajuste fino: es una conversión y cuantización del checkpoint original. La innovación técnica se limita al proceso de conversión a RKNN con cuantización w4a16 y reparto en 8 núcleos NPU, junto con la inclusión de sumas de verificación SHA-256 y un manifiesto de configuración. No se mencionan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imágenes en 1000 categorías (ImageNet-1k) a resolución 224x224.
- Inferencia sobre NPU Rockchip RK1820 y RK1828 con runtime RKNN v1.1.0.
- Ejecución en hardware embebido de bajo consumo, orientada al despliegue en el borde.
- Verificación de integridad de los artefactos mediante SHA-256.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- Capacidades multilingües: no aplica (modelo de visión).
- No dispone de modo "thinking", visión generativa ni funciones de conversación.

## Casos de uso

- Clasificación de imágenes en dispositivos embebidos: el modelo se ejecuta sobre NPU RK1820/RK1828 para etiquetar imágenes a 224x224 en tiempo real, adecuado para cámaras inteligentes o sensores industriales que no pueden depender de la nube.
- Prefiltrado en pipelines de visión: usar la clasificación ImageNet como primera etapa para descartar o enrutar imágenes antes de modelos más pesados, aprovechando el bajo coste de la cuantización w4a16.
- Control de calidad en línea de producción: clasificación de piezas o productos en cadenas de fabricación con hardware Rockchip, donde el consumo y el espacio son limitados.
- Prototipado rápido en robótica: integración del ViT cuantizado en robots o drones con SoC Rockchip para tareas de reconocimiento de escenas o categorías de objetos.
- Investigación en cuantización: servir como referencia para comparar la precisión de un ViT-Base en w4a16 frente a los pesos originales en FP32 sobre el mismo conjunto de validación.
- Sistemas de vigilancia con procesamiento local: clasificación de imágenes de cámaras IP en el propio dispositivo, evitando enviar datos a servidores externos por privacidad y latencia.
- Docencia y demostraciones de despliegue NPU: ejemplo práctico de conversión de un transformer de visión a RKNN con verificación de checksums y runtime versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM: no disponible de forma explícita; el repositorio ocupa ~0,1 GB y está pensado para memoria de dispositivo NPU, no para GPU convencional.
- Chips compatibles: Rockchip RK1820 y RK1828 exclusivamente.
- Núcleos NPU: 8 (configuración w4a16-8).
- Runtime: RKNN Runtime v1.1.0, con driver y runtime coincidentes; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- GPU de consumo: no aplica; el artefacto es un binario RKNN para NPU, no un modelo en safetensors o GGUF para GPU.
- Opciones de despliegue: runtime RKNN en el dispositivo Rockchip; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK182X-VIT-vit-base-patch16-224 | ViT-Base patch16 | no disponible (~86 M según base) | Imagen 224x224 | RKNN (w4a16) | Apache 2.0 | Hugging Face, ModelScope |
| google/vit-base-patch16-224 | ViT-Base patch16 | ~86 M (según modelo base) | Imagen 224x224 | Safetensors/PyTorch | Apache 2.0 | Hugging Face |
| Otros ViT cuantizados para NPU Rockchip | ViT | no disponible | Imagen 224x224 | RKNN | variable | variable |

La comparación directa con alternativas cuantizadas para RKNN no está disponible en la información proporcionada. Frente al modelo original de Google, la diferencia principal es el formato y la cuantización, no la arquitectura ni el número de parámetros.

## Limitaciones y advertencias

- Solo funciona en chips Rockchip RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a GPU, CPU genérica ni otros aceleradores sin reconversión.
- Es un artefacto derivado y cuantizado (w4a16), por lo que puede presentar una pérdida de precisión respecto a los pesos originales en FP32; no se documenta la magnitud de esa pérdida.
- No se especifican sesgos conocidos ni evaluación de robustez del modelo convertido.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de ImageNet-1k.
- Limitado a 1000 clases de ImageNet-1k; no admite categorías personalizadas sin reentrenamiento o ajuste del modelo fuente.
- La licencia Apache 2.0 del modelo fuente se mantiene, pero los artefactos RKNN están sujetos además a las licencias del RKNN Toolkit y del RKNN Runtime, cuyas librerías no se incluyen en el paquete.
- Es necesario verificar la integridad con `sha256sum -c SHA256SUMS` antes del despliegue y usar conjuntamente los ficheros de un mismo directorio de configuración.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VIT-vit-base-patch16-224
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- ModelScope (descarga indicada en la model card): comando `modelscope download --model UGREENDEV/RK182X-VIT-vit-base-patch16-224`
- Documentación de configuración incluida en el repositorio: `vit-base-patch16-224-224x224-w4a16-8/README.md` y `README_CN.md`
- Licencia del modelo fuente: fichero `LICENSE` del repositorio
- Atribución y modificaciones de conversión: fichero `NOTICE` del repositorio
