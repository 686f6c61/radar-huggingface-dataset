# yanivbl/stem-splitter-htdemucs-6s

## Resumen

`yanivbl/stem-splitter-htdemucs-6s` es un artefacto ONNX derivado de HTDemucs (Hybrid Transformer Demucs), el modelo de separación de fuentes musicales desarrollado por Simon Rouard, Francisco Massa y Alexandre Défossez en Meta AI. No es un modelo de lenguaje: su función es descomponer una mezcla musical estéreo en seis pistas o stems (batería, bajo, otros, voces, guitarra y piano). El autor lo publica como pieza central de la extensión de Chrome "Free AI Vocal Remover & Stem Splitter", que ejecuta la inferencia de forma local en el navegador mediante ONNX Runtime Web y WebGPU.

La particularidad técnica de esta publicación no está en los pesos, que son idénticos a los del modelo del que deriva, sino en el recorte del grafo: el export elimina la iSTFT incluida en el modelo original y termina en los tensores `/Pad_2_output_0` y `/Add_4_output_0`. La reconstrucción al dominio temporal se hace en JavaScript, lo que según el autor resulta aproximadamente 10 veces más rápido en WebGPU que ejecutar esa operación dentro del grafo ONNX.

El resultado es un fichero de unos 0,2 GB de repositorio, con licencia MIT, pensado para inferencia en cliente sin backend, con una entrada fija de `mix` de forma `[1, 2, 343980]` (estéreo a 44,1 kHz, aproximadamente 7,8 segundos por ventana). Su interés práctico es que reduce el coste de integración de separación de alta calidad en aplicaciones web, a cambio de asumir en el código del consumidor la implementación correcta de la fase final de reconstrucción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs): arquitectura híbrida de dominio temporal y espectral con atención; no es un transformer de lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de audio fija `mix` con forma `[1, 2, 343980]` (estéreo, 44,1 kHz, ~7,8 s por ventana) |
| Tipos de cuantización | no disponible (no se documentan variantes cuantizadas; se distribuye un único grafo ONNX) |
| Idiomas soportados | no aplica (modelo de audio); no disponible cualquier otra indicación |
| Licencia | MIT |
| Formato de pesos | ONNX (`htdemucs_6s_core.onnx`), pesos sin cambios respecto al modelo original |
| Salidas del grafo | `/Pad_2_output_0` y `/Add_4_output_0`; la iSTFT se ejecuta fuera del modelo, en JavaScript |
| Stems de salida | drums, bass, other, vocals, guitar, piano |
| SHA-256 del fichero | `3f1faadee943cabdd749506f5e120278553889e0b4154df372a23b3f3f4fe592` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

HTDemucs es un separador de fuentes que combina un encoder/decoder convolucional con un componente transformer que modela dependencias entre marcos temporales y entre bandas de frecuencia, de ahí la denominación "híbrido". La variante de seis stems amplía la salida clásica de cuatro pistas (drums, bass, other, vocals) con dos pistas adicionales, guitarra y piano, lo que exige al modelo desambiguar instrumentos con solapamiento espectral y temporal con la voz y con la categoría "other".

Sobre el entrenamiento no se aporta ningún dato en la información disponible: no se indica el número de tokens o de horas de audio, la composición del dataset, ni si hubo etapas de ajuste fino. Lo que sí se documenta es la intervención sobre el grafo: el export es un recorte de `kramp/htdemucs-6s-webgpu-onnx` que finaliza antes de la iSTFT en grafo, dejando esa operación al código JavaScript del cliente. Los pesos se declaran sin modificar. La cadena de procedencia es Meta AI (Demucs) → StemSplitio/htdemucs-6s-onnx → kramp/htdemucs-6s-webgpu-onnx → esta publicación, todas bajo licencia MIT.

## Capacidades

- Separación de audio musical en seis stems: batería, bajo, otros, voces, guitarra y piano.
- Procesamiento estéreo a 44,1 kHz con ventanas de 343.980 muestras por canal.
- Ejecución local en el navegador mediante ONNX Runtime Web, sin envío de audio a servidores externos.
- Aceleración por WebGPU, con la iSTFT delegada a JavaScript (aproximadamente 10 veces más rápida en WebGPU que dentro del grafo, según el autor).
- Integración como modelo ONNX en cualquier runtime compatible (onnxruntime en Python, C++, C#, Rust, etc.).
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponibles; este modelo no cubre ninguna de esas funciones.

## Casos de uso

- Separación de voces e instrumental para karaoke: la extensión carga el modelo en el navegador, aplica inferencia sobre la canción y reproduce la pista `vocals` o la mezcla del resto, sin subir el audio a un servidor.
- Remezcla y edición musical en herramientas web: un editor tipo DAW en el navegador puede solicitar los seis stems y permitir silenciar, aislar o procesar cada uno por separado, ajustando volumen y efectos en tiempo real.
- Extracción de stems para producción musical: obtener pistas de batería y bajo para samplear o construir bases, o aislar guitarra y piano para estudio de arreglos, a partir de una mezcla ya masterizada.
- Preprocesado para transcripción automática: separar `vocals` antes de enviar el audio a un sistema ASR reduce la interferencia de la instrumentación y suele mejorar la precisión en grabaciones musicales.
- Limpieza de audio en postproducción de vídeo o pódcast: usar la pista `other` o `vocals` para atenuar música de fondo o aislar la locución en piezas donde la voz compite con una cama musical.
- Práctica instrumental y educación musical: un estudiante puede silenciar la pista de guitarra o de piano y tocar sobre la base resultante, todo dentro del navegador y sin licencias de software adicionales.
- Investigación en recuperación de información musical (MIR): generación de datasets de stems etiquetados a partir de colecciones de audio para entrenar o evaluar modelos de transcripción, detección de acordes o análisis de estructura.
- Aplicación de escritorio o servicio interno vía ONNX Runtime: reutilizar el mismo grafo en Python o C++ para procesamiento por lotes de un catálogo musical, con la iSTFT implementada en el lenguaje anfitrión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada por el autor es relativa y afecta únicamente al coste de la iSTFT: ejecutarla en JavaScript sobre WebGPU resulta aproximadamente 10 veces más rápida que mantenerla dentro del grafo ONNX. No hay datos de SDR, SI-SDR, MUSHRA ni comparaciones numéricas con otros separadores.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB, lo que sitúa el peso de los tensores en ese orden de magnitud como cota superior; el consumo real de VRAM depende de las activaciones intermedias y no está documentado.
- Ejecución en cliente: cualquier navegador de escritorio con soporte de WebGPU (Chrome y derivados en versiones recientes) puede ejecutar el modelo; existe la vía de respaldo por WASM/CPU de ONNX Runtime Web, con latencia no disponible.
- GPU dedicadas para servidor: no se documentan requisitos ni configuraciones recomendadas; al tratarse de un modelo de audio de tamaño moderado, cualquier GPU con soporte de ONNX Runtime o CUDA es candidata, pero no hay cifras oficiales.
- GPU de consumo: el modelo está diseñado explícitamente para ejecutarse en el navegador del usuario final, lo que implica que cabe en equipos de consumo; no se especifican modelos concretos ni VRAM mínima.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WASM) en navegador, onnxruntime en Python/C++/C#/Rust para escritorio o servidor, y runtimes compatibles con ONNX en general.
- Latencia y throughput: no disponibles. Solo se conoce la mejora relativa de la iSTFT (~10x) al sacarla del grafo en WebGPU.
- La ventana de entrada es fija (~7,8 s), por lo que para temas completos hay que segmentar y recomponer con solapamiento en el código cliente.

## Comparativa con modelos similares

| Modelo | Formato | Stems | Licencia | Ejecución en navegador | Disponibilidad |
|---|---|---|---|---|---|
| yanivbl/stem-splitter-htdemucs-6s (este modelo) | ONNX recortado (sin iSTFT) | 6 | MIT | Sí, vía ONNX Runtime Web + WebGPU | HuggingFace, 0 descargas |
| kramp/htdemucs-6s-webgpu-onnx | ONNX con iSTFT en grafo | 6 | MIT | Sí, WebGPU | HuggingFace |
| StemSplitio/htdemucs-6s-onnx | ONNX | 6 | MIT | Posible, sin optimización específica declarada | HuggingFace |
| HTDemucs original (facebookresearch/demucs) | PyTorch | 4 y 6 (variantes) | MIT | No | Repositorio oficial de Meta AI |

No se dispone de datos de parámetros, contexto de audio ni métricas de calidad para establecer una comparación cuantitativa entre estas alternativas; la comparación se limita a formato, licencia y vía de despliegue.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier ficha que lo trate como LLM es incorrecta.
- Sin benchmarks publicados: no hay evidencia numérica de calidad de separación (SDR/SI-SDR) en la información disponible, ni comparación con la variante de cuatro stems.
- El grafo no incluye la iSTFT: si el consumidor no implementa correctamente la reconstrucción (ventanas, solapamiento, fase), la salida será incorrecta aunque el modelo se ejecute sin errores.
- Ventana de entrada fija de 343.980 muestras: requiere segmentación con solapamiento para audio de duración arbitraria; los empalmes mal ajustados pueden producir artefactos audibles en las fronteras.
- Sin información sobre sesgos, composición del dataset de entrenamiento ni cobertura de géneros musicales; el rendimiento puede degradarse en material alejado de la distribución de entrenamiento (música no occidental, grabaciones de campo, audio muy comprimido).
- Estado de validación comunitario mínimo: 0 descargas y 0 likes, sin pipeline declarado en HuggingFace; conviene verificar el SHA-256 publicado antes de integrarlo.
- Licencia MIT: permite uso comercial y modificaciones, pero exige conservar el aviso de copyright de Meta Platforms, Inc. y de los autores de los exports intermedios.
- Advertencia legal ajena al modelo: procesar audio protegido por derechos de autor puede requerir autorización, con independencia de la licencia del software.
- No se documentan versiones cuantizadas ni requisitos de memoria; la estimación de recursos debe hacerse empíricamente antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yanivbl/stem-splitter-htdemucs-6s
- Modelo del que deriva: https://huggingface.co/kramp/htdemucs-6s-webgpu-onnx
- Export intermedio citado: StemSplitio/htdemucs-6s-onnx (referenciado en la model card; sin URL directa en la información disponible)
- Repositorio oficial de Demucs (Meta AI): https://github.com/facebookresearch/demucs
- ONNX Runtime Web (documentación de despliegue en navegador): no disponible en la información proporcionada
