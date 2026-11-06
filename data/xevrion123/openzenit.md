# xevrion123/OpenZenit

## Resumen

OpenZenit es un modelo de lenguaje de tipo Transformer causal desarrollado por el usuario de Hugging Face `xevrion123` (autoría del repositorio original atribuida a `programador777lolxddd-dot`) como proyecto personal de caracter educativo y experimental. Su objetivo declarado no es competir con modelos de produccion, sino servir como banco de pruebas para estudiar el entrenamiento neuronal desde cero, la generacion de texto y la generacion de codigo con PyTorch. El modelo se distribuye bajo licencia Apache 2.0 y declara soporte para castellano e ingles.

El proyecto se compone de codigo Python (no solo pesos), con una implementacion principal (`openzenit.py`) y una alternativa (`mini_codegpt.py`), un corpus de entrenamiento de ejemplo (`data/corpus.txt`) y una CLI para entrenar y generar. No se publican en la model card el numero de parametros, la longitud de contexto, la composicion del dataset ni resultados de benchmarks, por lo que la mayor parte de las especificaciones cuantitativas figuran como no disponibles.

Su relevancia actual es limitada y de nicho: resulta util como material didactico reproducible para quien quiera entender el ciclo completo de un modelo de lenguaje pequeno (tokenizacion, entrenamiento causal, muestreo) y como base modificable para experimentos academicos o personales, no como componente de sistemas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio se distribuye como codigo Python/PyTorch; no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

OpenZenit implementa un Transformer causal en Python sobre PyTorch, entrenado desde cero con un corpus pequeno de ejemplo incluido en el repositorio (`data/corpus.txt`). La model card no detalla el numero de capas, dimensiones ocultas, cabezas de atencion, tamano del vocabulario ni el numero de tokens de entrenamiento. Tampoco se documenta el uso de tecnicas de alineacion como RLHF, DPO o SFT, ni innovaciones como atencion lineal, decodificacion especulativa o mezcla de expertos.

El entrenamiento puede ejecutarse en CPU y, cuando esta disponible y es compatible, en GPU, segun indica el autor. El flujo de uso previsto es reentrenar el modelo con `python3 openzenit.py --retrain` y generar texto con `python3 openzenit.py --prompt "..." --tokens N`. Existe una segunda implementacion, `mini_codegpt.py`, orientada a generacion de codigo, con su propio comando de reentrenamiento.

## Capacidades

- Generacion de texto autoregresiva a partir de un prompt, con control del numero de tokens generados.
- Generacion de fragmentos de codigo, especialmente en el contexto de la implementacion alternativa Mini-CodeGPT.
- Ejecucion en CPU y en GPU cuando el entorno lo permite.
- Interfaz de linea de comandos para entrenamiento, generacion e interaccion.
- Capacidades multilingues declaradas para castellano e ingles (sin evaluacion publicada de calidad por idioma).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Aprendizaje del ciclo de entrenamiento de un LLM: el repositorio permite ejecutar un entrenamiento desde cero con un corpus propio y observar el efecto de los hiperparametros, lo que lo hace adecuado para cursos y talleres de introduccion a PyTorch.
- Practicas de generacion de codigo a pequena escala: usar `mini_codegpt.py` con prompts como `def sumar(a, b):` para estudiar como un modelo diminuto completa funciones simples y donde falla.
- Experimentos de tokenizacion y corpus: sustituir `data/corpus.txt` por un corpus propio (por ejemplo, documentacion tecnica en castellano) y medir como cambia la perplejidad y la coherencia de las muestras.
- Base para pruebas de metodos de muestreo: comparar temperatura, top-k y top-p sobre un modelo pequeno donde el coste computacional es minimo y los ciclos de iteracion son rapidos.
- Docencia sobre limitaciones de los LLM: emplear sus salidas repetitivas o incoherentes como ejemplo practico de memorizacion, sobreajuste con corpus pequenos y alucinacion.
- Prototipado de interfaces CLI de inferencia: reutilizar la estructura de `openzenit.py` como esqueleto para herramientas internas de generacion de texto en entornos con recursos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados experimentales no constituyen una evaluacion formal de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no declararse el numero de parametros no puede calcularse con rigor. Por la naturaleza del proyecto (modelo "muy pequeno" segun el autor y entrenamiento factible en CPU) es plausible que quepa en GPUs de consumo, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. El autor solo indica compatibilidad con GPU "cuando esta disponible y es compatible".
- Cabe en GPU de consumo: no confirmado con datos; el entrenamiento en CPU esta soportado de forma explicita.
- Opciones de despliegue: ejecucion directa con Python 3.10+ y PyTorch mediante la CLI del repositorio. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado parametros, contexto ni resultados que permitan una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, modelos educativos pequenos tipo nanoGPT o Mini-CodeGPT). La unica referencia interna es la propia implementacion alternativa del repositorio, `mini_codegpt.py`, de la que tampoco se ofrecen especificaciones.

## Limitaciones y advertencias

- Modelo experimental y educativo: el propio autor advierte que no es comparable con los grandes modelos de lenguaje actuales.
- Riesgo alto de texto incoherente, repetitivo y de codigo incorrecto o inseguro; no garantiza validez ni seguridad del codigo generado.
- Memorizacion y repeticion probables debido al corpus de entrenamiento pequeno.
- No es un agente autonomo y no debe sustituir la revision humana del codigo.
- Sesgos conocidos: no documentados; al desconocerse la composicion del corpus no puede evaluarse el sesgo.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y no hay evaluacion de calidad por idioma pese a declarar es y en.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar avisos de copyright y atribucion, incluir el archivo NOTICE y senalar los cambios realizados.
- Para produccion: no recomendado; no hay benchmarks, ni especificaciones de pesos, ni soporte de tooling de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xevrion123/OpenZenit
- Repositorio original en GitHub: https://github.com/programador777lolxddd-dot/OpenZenit
- Perfil del autor en Hugging Face: https://huggingface.co/xevrion123
