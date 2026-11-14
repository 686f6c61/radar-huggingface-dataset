# Xylolabs/omnivla-original-Tensix-Components

## Resumen

OmniVLA es una política de navegación robótica que combina percepción visual, instrucciones en lenguaje natural y pose de objetivo local para producir acciones de control. El modelo original, desarrollado por N. Hirose, se presenta aquí como un archivo de componentes de inferencia empaquetado por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix. No se trata de un checkpoint completo y ejecutable, sino de una selección de 38 archivos de tensores (1.026 entradas en total) extraídos de la política original con valores y tipos de datos preservados.

El archivo cubre la extracción de características penúltimas de los backbones DINOv2 y SigLIP, las proyecciones de entrada de parches y de pose multimodal, el módulo de embedding, 32 bloques bidireccionales de prefijo de lenguaje, la normalización final y la cabeza de regresión de acciones. Se excluyen las cabezas de lenguaje y visión no utilizadas, los bloques finales de visión, la cabeza de distancia y el adaptador LoRA separado. El resultado es un conjunto de operandos listo para integrarse en un runtime propio, no un modelo autónomo.

La relevancia de esta ficha es doble: por un lado documenta la arquitectura interna de OmniVLA, una política VLA orientada a navegación robótica; por otro, muestra el patrón de empaquetado por componentes que permite portar modelos grandes a hardware no convencional (en este caso, Tensix) sin recurrir a cuantización adicional. El archivo ocupa unos 15,0 GB en pesos y requiere aproximadamente 15,09 GB de memoria de dispositivo antes de buffers de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA con backbones de visión DINOv2 y SigLIP, proyección de pose multimodal, 32 bloques bidireccionales de prefijo de lenguaje y cabeza de regresión de acciones |
| Parametros totales | no disponible (el archivo contiene 1.026 entradas de tensores; no se declara el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las tablas rotatorias cubren 608 posiciones) |
| Tipos de cuantizacion | sin cuantización nueva: 1.018 entradas en BF16 y 8 en FP32; presupuesto conservador de pesos en mosaicos 32×32 de ~15,09 GB |
| Idiomas soportados | en (inglés) |
| Licencia | omnivla-mit-llama2-apache2 (MIT de OmniVLA + acuerdo comunitario y política de uso aceptable de Llama 2 + Apache 2.0 del backbone) |
| Formato de pesos | safetensors (BF16 y FP32), con `component.json` que describe forma, dtype y hash de cada tensor |

## Arquitectura y entrenamiento

La política original OmniVLA procesa dos imágenes de 224×224 junto con una pose de objetivo local y una instrucción en lenguaje natural. La percepción se reparte entre dos backbones visuales: DINOv2 (variante con registers, large) y SigLIP (ViT so400m patch14 224). De ambos se extraen características penúltimas, que se proyectan junto con la pose mediante pesos FP32 y se combinan en un módulo de embedding multimodal. Sobre esa representación opera una pila de 32 bloques transformer con atención bidireccional de prefijo, seguida de una normalización final y una cabeza de regresión que emite la acción. Las tablas rotatorias cubren 608 posiciones.

El archivo empaquetado no incluye información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO. Tampoco documenta innovaciones de decodificación o atención más allá de la atención bidireccional de prefijo, que el autor del empaquetado señala explícitamente como un elemento que debe preservarse en la integración. La evaluación publicada se limita a verificar la serialización y la identidad de las fuentes: los 958 tensores aprendidos y las cuatro constantes de preprocesado coinciden con los artefactos originales fijados, los cuatro shards safetensors de origen y dos archivos auxiliares de pesos coinciden con sus identidades LFS en Hugging Face, las 64 tablas rotatorias reproducen exactamente la generación de referencia en BF16 y todos los valores almacenados son finitos. No se reportan métricas de tarea ni de velocidad.

## Capacidades

- Percepción visual multimodal a partir de dos imágenes RGB de 224×224, con extracción de características penúltimas de DINOv2 y SigLIP.
- Fusión de instrucción en lenguaje natural con pose de objetivo local para producir representaciones de navegación.
- Regresión de acciones de control robótico mediante cabeza dedicada.
- Atención bidireccional de prefijo sobre 32 bloques, adecuada para condicionamiento contextual completo en lugar de generación autoregresiva.
- Carga por componentes con verificación de hash, nombres, formas, dtypes y valores finitos, pensada para streaming tensor a tensor.
- No implementa inferencia de política por sí mismo: requiere arquitectura, tokenizador, procesador de imágenes y mapeo de nombres de componentes del modelo original.
- No incluye capacidades de tool calling, function calling, agentes, visión generativa, audio ni modo de razonamiento explícito.

## Casos de uso

- Navegación robótica en interiores: la política consume dos vistas de 224×224 y una pose de objetivo local para emitir acciones de desplazamiento; es su función principal y el escenario para el que fue entrenada.
- Seguimiento de instrucciones en lenguaje natural dentro de un robot móvil: la proyección multimodal combina texto e imagen, lo que permite condicionar la trayectoria a órdenes como "ve a la puerta" sin reentrenar el backbone.
- Portabilidad a aceleradores Tenstorrent: el empaquetado por componentes permite cargar tensores individuales y subirlos a Tensix con un adaptador de integración, útil para pipelines de inferencia en hardware no NVIDIA.
- Investigación en arquitecturas VLA: al exponer bloques internos (proyecciones, embeddings, bloques de prefijo, cabeza de acción), sirve para estudiar o ablacionar partes de la política sin cargar el checkpoint completo.
- Validación de serialización y reproducibilidad: el cargador verifica hashes y valores finitos, por lo que es útil como referencia para comprobar que una integración respeta los pesos originales.
- Prototipado de control en simulación: integrado en un simulador robótico con el adaptador adecuado, permite evaluar la política antes de desplegarla en un robot físico.
- Docencia y análisis de modelos multimodales: la separación entre backbones visuales, proyección de pose y pila de lenguaje facilita explicar cómo se compone una política VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara verificaciones de serialización e identidad de fuentes (coincidencia de 958 tensores aprendidos y 4 constantes de preprocesado, reproducción exacta de las 64 tablas rotatorias en BF16 y finitud de todos los valores), y señala explícitamente que la velocidad no se reporta y que una política integrada requiere su propia evaluación numérica y de tareas robóticas.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 15,09 GB para los pesos en mosaicos 32×32, más espacio para buffers de trabajo; el autor indica unos 15,09 GB como presupuesto conservador antes de buffers.
- Almacenamiento: repositorio de 15,0 GB; el cargador de streaming evita mantener el archivo completo en memoria host.
- GPU recomendadas: no disponible en la información proporcionada; el destino declarado es Tenstorrent Tensix, no GPU convencionales.
- GPU de consumo: no disponible; por tamaño de pesos, una GPU consumer de 16 GB quedaría al límite y sin margen para buffers, pero no hay confirmación del autor.
- Opciones de despliegue: PyTorch, safetensors y huggingface_hub con el cargador `load_components.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card indica que la velocidad no se reporta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVLA (original, NHirose/omnivla-original) | Política VLA de navegación | no disponible | no disponible (608 posiciones rotatorias) | MIT + Llama 2 + Apache 2.0 | Hugging Face |
| OmniVLA Tensix Components (este archivo) | Componentes de inferencia de OmniVLA | no disponible (1.026 entradas) | no disponible | MIT + Llama 2 + Apache 2.0 | Hugging Face |
| SmolVLA | Política VLA compacta | no disponible en esta ficha | no disponible | no disponible | Hugging Face (referenciado en la model card) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un checkpoint ejecutable: requiere arquitectura, tokenizador, procesador de imágenes y mapeo de nombres de componentes del modelo original, además de un adaptador de integración.
- Excluye componentes relevantes de la política original (cabezas de lenguaje y visión no utilizadas, bloques finales de visión, cabeza de distancia y adaptador LoRA), por lo que no reproduce el comportamiento completo sin trabajo adicional.
- Solo soporta inglés según la metadata del modelo.
- No hay evaluación de tareas robóticas ni de velocidad publicada; las verificaciones son de serialización e identidad de fuentes.
- Licencia compuesta: conviven los términos MIT de OmniVLA, el acuerdo comunitario y la política de uso aceptable de Llama 2 y las condiciones Apache 2.0 del backbone; el uso comercial debe revisarse contra los tres textos incluidos en `LICENSE` y `NOTICE`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para esta política.
- El cargador de streaming solo cubre Apache 2.0 (`CODE_LICENSE`); el resto del archivo queda bajo los términos heredados.
- Se entrega tal cual, sin garantía.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/omnivla-original-Tensix-Components
- Modelo base: https://huggingface.co/NHirose/omnivla-original
- Proyecto OmniVLA: https://github.com/NHirose/OmniVLA
- Llama 2 (origen heredado): https://huggingface.co/meta-llama/Llama-2-7b-hf
- DINOv2 con registers: https://huggingface.co/facebook/dinov2-with-registers-large
- SigLIP (timm): https://huggingface.co/timm/vit_so400m_patch14_siglip_224.webli
- Repositorio de herramientas Tensix de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
