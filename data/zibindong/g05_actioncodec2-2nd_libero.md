# ZibinDong/G05_ActionCodec2-2nd_LIBERO

## Resumen

G05_ActionCodec2-2nd_LIBERO es una política vision-language-action (VLA) para robótica manipulativa, desarrollada por el usuario ZibinDong como fine-tuning del modelo base OpenGalaxea/G05 sobre el benchmark LIBERO. El modelo combina un backbone VLA con el tokenizador de acciones ActionCodec2-2nd, en su variante `paper-o2-5mm-4k-2bin-1p2ms` (edición Paper de 5 mm con un presupuesto de 4.096 tokens por perfil), lo que permite discretizar acciones continuas en tokens y reutilizar la infraestructura de los modelos de lenguaje para el control robótico.

El checkpoint, de 2.225.439.552 parámetros (aproximadamente 2,2 mil millones) y 8,9 GB en el repositorio, incluye el tokenizador de acciones, los assets ajustados y el tokenizador de texto, de modo que la inferencia funciona de forma offline sin necesidad del checkpoint base G0.5 ni de otro repositorio de tokenizadores. Está pensado para control robótico a 20 Hz con un espacio de acciones `delta_eef` (posición y orientación del efector final más dos dedos de pinza), devolviendo secuencias de 20 acciones de dimensión 7.

Su relevancia actual radica en que demuestra un enfoque de tokenización de acciones de alta resolución aplicado a un VLA de tamaño moderado, con un contrato de inferencia bien definido (cámaras, estado de 8 valores, acción previa) y un paquete de software específico (`actioncodec2`) que incluye recetas de entrenamiento y clientes de evaluación. La licencia es no comercial, lo que restringe su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con tokenizador de acciones ActionCodec2-2nd; detalles internos no disponibles |
| Parámetros totales | 2.225.439.552 (~2,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el tokenizador de texto es Qwen3.5) |
| Licencia | G0.5 Community License (no comercial, sin derechos de despliegue comercial); assets del tokenizador bajo Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del VLA OpenGalaxea/G05 sobre el benchmark LIBERO, acoplado al tokenizador de acciones ActionCodec2-2nd en su configuración `paper-o2-5mm-4k-2bin-1p2ms`. Este tokenizador discretiza las acciones con una resolución de 5 mm y un presupuesto de 4.096 tokens por perfil, con un esquema de 2 bins y un paso temporal de 1,2 ms según la nomenclatura del identificador. El checkpoint incorpora el vocabulario del tokenizador de acciones, que está ligado a los pesos entrenados: no debe sustituirse por el de la edición Extended, retrenada con datos de preentrenamiento más limpios y filtrados.

La política opera a 20 Hz y produce secuencias de 20 acciones de dimensión 7 en el espacio `delta_eef`, con representación de rotación en vector de rotación. El adaptador convierte la acción previa (a 20 Hz) al límite de 15 Hz del tokenizador. La inferencia se ha verificado con Python 3.12, PyTorch 2.7.1 y Transformers 5.14.1, e incluye dependencias opcionales de Liger y Flash Linear Attention mediante el extra `cuda`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Control robótico manipulativo mediante predicción de acciones en el espacio `delta_eef` a partir de imágenes RGB y una instrucción en lenguaje natural.
- Procesamiento de dos cámaras: `observation.images.image` y `observation.images.wrist_image`, redimensionadas a 256 × 256.
- Generación de secuencias de 20 acciones de dimensión 7, ejecutando 10 acciones antes de replanificar.
- Uso de estado observado de 8 valores (posición del efector final, orientación como vector de rotación y posiciones de ambos dedos de la pinza).
- Condicionamiento en la acción previa ejecutada (vector de 7) para mantener continuidad de movimiento.
- Inferencia offline completa: el repositorio incluye tokenizador de acciones, assets ajustados y tokenizador de texto.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede ejecutar tareas de pick-and-place y manipulación fina sobre el benchmark LIBERO, sirviendo como referencia para comparar políticas VLA con tokenización de acciones.
- Investigación en tokenización de acciones: permite evaluar el impacto de la resolución de 5 mm y del presupuesto de 4.096 tokens por perfil en el rendimiento de una política VLA, al estar el tokenizador empaquetado con los pesos.
- Reproducción de experimentos: al incluir recetas de entrenamiento y clientes de evaluación en el archivo fuente de `actioncodec2`, facilita la replicación de resultados sobre LIBERO.
- Prototipado de control a 20 Hz: la frecuencia de control y la ejecución de 10 acciones antes de replanificar permiten integrar el modelo en bucles de control de robots manipuladores de laboratorio.
- Evaluación comparativa de VLA de tamaño moderado: con ~2,2 B de parámetros, es adecuado para estudiar el equilibrio entre capacidad y requisitos de cómputo en robótica.
- Desarrollo de pipelines de inferencia offline: al no requerir el checkpoint base ni conexión de red tras la descarga, encaja en entornos aislados de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~2,2 B de parámetros, una estimación en precisión de 16 bits rondaría los 4,5 GB de pesos, más overhead de activaciones y del procesador de imágenes.
- GPU recomendadas: no disponibles; el ejemplo de la model card requiere una GPU con soporte CUDA.
- Cabe en GPU de consumo: no confirmado, pero el tamaño de parámetros es compatible con GPUs de consumo de gama alta; no se especifica ningún modelo concreto.
- Opciones de despliegue: paquete `actioncodec2` (extra `cuda` con Liger y Flash Linear Attention); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: control a 20 Hz documentado; no se publican cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G05_ActionCodec2-2nd_LIBERO | ~2,2 B | no disponible | no disponible | G0.5 Community (no comercial) | Hugging Face |
| OpenGalaxea/G05 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: la G0.5 Community License no otorga derechos de despliegue comercial; cualquier uso en producción requiere autorización adicional.
- El vocabulario del tokenizador de acciones está ligado a los pesos entrenados; sustituirlo por el de la edición Extended u otro tokenizador invalida el modelo.
- La acción previa debe pasarse en cada predicción con las mismas unidades y convención de pinza que las acciones devueltas; un límite de movimiento cero solo es válido si se sabe que el movimiento precedente fue nulo.
- El modelo está ajustado específicamente sobre LIBERO; su generalización a otros entornos, robots o tareas no está documentada.
- No se dispone de información sobre sesgos, tasa de alucinación, cobertura idiomática ni comportamiento fuera de distribución.
- Los assets del tokenizador usan Apache-2.0 y el tokenizador de texto Qwen3.5 tiene su propia licencia, lo que añade obligaciones de cumplimiento adicionales.
- Requiere Python 3.12 o superior, compilador C++17 y GPU CUDA; la compatibilidad con otras versiones de PyTorch o Transformers no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_LIBERO
- Modelo base: https://hf-mirror.com/OpenGalaxea/G05
- Paquete ActionCodec2 (v0.1.0): https://hf-mirror.com/ZibinDong/ActionCodec2/resolve/v0.1.0/actioncodec2-0.1.0.tar.gz
- Configuración de la política: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_LIBERO/blob/main/policy_config.json
- Licencia G0.5 Community: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_LIBERO/blob/main/LICENSE
- Aviso legal: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_LIBERO/blob/main/NOTICE
- Licencia del tokenizador de texto Qwen3.5: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_LIBERO/blob/main/LICENSE_QWEN3_5.txt
