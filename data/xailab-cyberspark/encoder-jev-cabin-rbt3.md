# XAILab-CyberSpark/encoder-jev-cabin-rbt3

## Resumen

Encoder-JEV Cabin Decisions es un modelo de clasificación de texto en chino desarrollado por OpenSparX (上海塞伯火种人工智能有限公司) y publicado en HuggingFace bajo el identificador XAILab-CyberSpark/encoder-jev-cabin-rbt3. Se trata de un encoder transformer inicializado parcialmente a partir de hfl/rbt3 (una variante china de RoBERTa de tres capas) al que se le han añadido una representación de estado compartida, seis ramas de decisión aisladas y una cabeza de opciones personalizada. El modelo resuelve un problema muy concreto: dada una frase del usuario y un vector de estado de cabina (velocidad, temperatura, estado de carga, autonomía prevista, distancia al destino y ocupación de asientos), produce una decisión de enrutado de seis vías y cuatro puntuaciones softmax de sí/no para servicios individuales.

El modelo ocupa 47.117.799 parámetros y el repositorio pesa 0,2 GB. No es un modelo generativo ni autorregresivo: es un clasificador de intención orientado a sistemas de diálogo embarcados en vehículo. Su relevancia actual es acotada y de carácter investigador: se publica como referencia reproducible en FP32 para PyTorch/CUDA y CPU, con 0 descargas y 0 likes en el momento de redactar esta ficha.

Conviene señalar dos advertencias de partida. Primero, el autor de HuggingFace (XAILab-CyberSpark) no coincide con el desarrollador indicado en la model card (OpenSparX). Segundo, tanto el entrenamiento como la validación son sintéticos, el modelo no ejecuta ningún control real del vehículo y las puntuaciones de salida están sin calibrar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer con representación de estado compartida, seis ramas de decisión aisladas y cabeza de opciones; inicializado a partir de hfl/rbt3 |
| Parámetros totales | 47.117.799 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (config.json fija S128; no se aclara si corresponde a la longitud de secuencia) |
| Tipos de cuantización | FP32 en safetensors; no se incluyen variantes cuantizadas en este repositorio |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Modelo base | hfl/rbt3 (relación: finetune) |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,2 GB |
| Dimensiones fijadas en config.json | S128, seis preguntas, B96, seis slots de opción, hidden size 768, tres capas de State y una capa de rama |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo RBT3 (RoBERTa china, tres capas, hidden size 768) sobre el que se construye un módulo de estado compartido con tres capas y seis ramas de decisión independientes, más una cabeza de opciones con seis slots. La configuración fijada en config.json establece S128, seis preguntas, B96, seis slots de opción y hidden size 768. Las seis salidas comparten la representación de estado, pero no forman una secuencia autorregresiva: son cabezas de clasificación paralelas.

El entrenamiento se realizó sobre 1.101 registros de entrenamiento y 284 de validación, con frases en chino generadas mediante DeepSeek y revisadas manualmente, y etiquetas producidas por reglas deterministas del proyecto. El repositorio no contiene el corpus sintético de entrenamiento. La mejor selección de checkpoint fue la época 4, con un exact match de seis preguntas de 282/284 (99,30%) en validación. En un conjunto de demostración guionizado de 50 casos, el modelo FP32 por sí solo alcanzó 42/50 de coincidencia de registro completo. El autor indica explícitamente que la capa de arbitraje que permite llegar a 50/50 no se incluye en esta publicación y que ese resultado es una regresión ensayada, no una métrica de generalización. Un descendiente cuantizado se compiló y ejecutó en SA8397/Hexagon V81 como experimento de ingeniería separado; su contexto QNN y los binarios del SDK de Qualcomm no forman parte de este repositorio, que es únicamente para inferencia en coma flotante sobre CUDA y CPU.

## Capacidades

- Clasificación de intención de cabina en chino: genera una decisión de enrutado de seis vías a partir de una frase y un vector de estado.
- Puntuaciones de servicio por servicio: produce cuatro softmax de sí/no para servicios individuales (sin calibrar).
- Condicionamiento por estado numérico: incorpora campos como velocidad, temperatura de cabina, SOC, autonomía prevista, distancia al destino y ocupación de asientos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no hay bucle de decisión ni planificación.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado al chino (zh); no se declara soporte de otros idiomas.
- Inferencia en FP32 sobre CUDA y CPU mediante código de inferencia propio (inference.py).

## Casos de uso

- Enrutado de intención en asistentes de voz embarcados: el modelo recibe la transcripción de la frase del usuario y el estado de cabina, y devuelve una de seis rutas de decisión, lo que permite derivar la petición al servicio correspondiente antes de invocar cualquier lógica de negocio.
- Clasificación de servicios individuales: las cuatro cabezas sí/no permiten decidir de forma granular si debe activarse un servicio concreto (por ejemplo, climatización) sin necesidad de un clasificador distinto por servicio.
- Prototipado rápido de NLU en cabina: al ser un modelo de 47M parámetros con pesos FP32 y código de inferencia incluido, sirve para montar un prototipo funcional en una GPU de consumo o en CPU en pocos minutos.
- Investigación sobre decisión condicionada por estado: la combinación de encoder compartido más ramas aisladas es un caso de estudio útil para experimentos académicos sobre arquitecturas multi-cabeza con contexto numérico.
- Punto de partida para fine-tuning con datos propios: al ser un finetune de hfl/rbt3 con licencia Apache-2.0, puede reentrenarse con corpus reales de un fabricante concreto.
- Validación y regresión de sistemas de diálogo: el script de inferencia y el formato de estado JSON permiten construir pruebas de regresión reproducibles sobre frases guionizadas.
- Evaluación de calibración de umbrales: dado que las salidas son softmax sin calibrar, es un banco de pruebas para estudiar técnicas de calibración antes de desplegar una política de acción.
- Selección de modelo en pipelines con restricciones de cómputo: el tamaño reducido y la ausencia de dependencias propietarias lo hacen apto para entornos donde no se pueden usar binarios QNN del SDK de Qualcomm.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado | Notas |
|---|---|---|---|
| Validación interna (284 registros) | Exact match de seis preguntas | 282/284 (99,30%) | Checkpoint de la época 4; validación sintética |
| Conjunto guionizado (50 casos) | Coincidencia de registro completo, FP32 solo modelo | 42/50 (84%) | Modelo sin capa de arbitraje |
| Conjunto guionizado (50 casos) | Coincidencia de registro completo, híbrido modelo + arbitraje CPU | 50/50 | Regresión ensayada; la capa de arbitraje no se publica y no es precisión del modelo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Pesos FP32 de 47,1M parámetros: aproximadamente 188 MB en memoria, en línea con el tamaño de repositorio de 0,2 GB.
- VRAM estimada para inferencia: por debajo de 1-2 GB sumando pesos, activaciones y overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM; no se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090 o similares, así como en CPU.
- Opciones de despliegue: PyTorch con CUDA o CPU mediante el inference.py incluido. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y usa código propio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| encoder-jev-cabin-rbt3 | 47.117.799 | no disponible | Apache-2.0 | HuggingFace (0 descargas) | Finetune de hfl/rbt3 con ramas de decisión de cabina |
| hfl/rbt3 | no disponible | no disponible | Apache-2.0 | HuggingFace | Modelo base; el autor lo cita como inicialización previa |
| Otros encoders chinos de clasificación de intención (bert-base-chinese, RoBERTa-wwm-ext-chinese y similares) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento comparables en la información proporcionada |

No se dispone de benchmarks comunes entre este modelo y alternativas de la misma categoría, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los campos de estado son entradas de demostración, no señales autenticadas del vehículo; el modelo no ejecuta controles reales del coche.
- Entrenamiento y validación son sintéticos: el autor advierte que necesitan evaluación independiente el ASR real, las frases no vistas, las señales ausentes y cualquier comportamiento crítico para la seguridad.
- Las puntuaciones de salida están sin calibrar y no deben presentarse como probabilidades fiables.
- Las seis salidas comparten la representación de estado, pero no constituyen una secuencia autorregresiva; cualquier política de acción de cara al usuario exige validación explícita y umbrales calibrados.
- El resultado híbrido de 50/50 es una regresión ensayada sobre un conjunto ya inspeccionado, no una medida de generalización independiente.
- No se incluyen archivos QNN, catálogos de API del vehículo, secretos de servicio ni datos de usuario.
- El repositorio no contiene el corpus sintético de entrenamiento, lo que dificulta reproducir el proceso de etiquetado.
- El modelo solo maneja chino y está orientado a un dominio muy estrecho (intención de cabina); no debe usarse fuera de ese ámbito sin reentrenamiento.
- Existe una discrepancia entre el autor de HuggingFace (XAILab-CyberSpark) y el desarrollador declarado en la model card (OpenSparX), que conviene aclarar antes de cualquier uso.
- Las fechas de creación y actualización indicadas (2026) y la ausencia total de descargas y likes hacen recomendable tratar esta publicación como un artefacto de investigación no validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XAILab-CyberSpark/encoder-jev-cabin-rbt3
- Modelo base hfl/rbt3: https://huggingface.co/hfl/rbt3
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
