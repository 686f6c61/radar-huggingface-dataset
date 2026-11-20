# taobao-mnn/gemma-7b-it-MNN

## Resumen

`taobao-mnn/gemma-7b-it-MNN` es una conversión al formato MNN del modelo `google/gemma-7b-it`, el modelo instructivo de 7.000 millones de parámetros publicado por Google. El repositorio lo mantiene el equipo taobao-mnn, vinculado al motor de inferencia MNN (Mobile Neural Network) de Alibaba, y su objetivo es permitir la ejecución del modelo en CPU y dispositivos móviles mediante cuantización agresiva, sin depender de GPUs dedicadas ni de frameworks de servidor.

Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo: el conocimiento, el tokenizador y la arquitectura subyacentes son los de Gemma 7B instruct, mientras que la aportación del repositorio es el grafo MNN, los pesos cuantizados y una configuración de ejecución optimizada para memoria baja. La relevancia actual reside en que permite integrar un modelo de 7B en aplicaciones de escritorio o Android con un consumo de memoria reducido, a costa de una precisión degradada que el propio autor documenta de forma explícita.

El paquete ocupa 11,3 GB en el repositorio, emplea pesos HQQ de 4 bits en las capas del transformer y 8 bits en la cabeza de salida, y mantiene las incrustaciones en BF16 en un fichero separado. Está pensado para inglés y conserva la licencia Gemma original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 7B), exportado a grafo MNN |
| Parametros totales | 7.000 millones (modelo base `google/gemma-7b-it`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no verificada en este paquete; el autor indica que la máxima contexto no está validada) |
| Tipos de cuantizacion | HQQ 4-bit grupo 128 asimétrico en pesos del transformer; HQQ 8-bit grupo 128 asimétrico en cabeza de salida; escalas de cuantización en FP16; incrustaciones en BF16 separadas |
| Idiomas soportados | inglés (declarado en la model card y en los tags) |
| Licencia | Gemma (licencia y política de uso prohibido de Google) |
| Formato de pesos | MNN (`.mnn`, `embeddings_bf16.bin`, `config.json`, tokenizador); no se distribuyen safetensors ni GGUF |
| Capas / dimensión oculta | 28 capas / 3072 dimensiones |
| Configuración por defecto | CPU, 4 hilos, `precision=low`, `memory=low`, muestreo `mixed` del runtime |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma 7B instruct original de Google: un transformer decoder-only con 28 capas y dimensión oculta de 3072, entrenado por Google sobre datos mayoritariamente en inglés y afinado con técnicas de alineación (RLHF) para uso instructivo. Este repositorio no aporta entrenamiento adicional ni fine-tuning: es una conversión de pesos con cuantización post-entrenamiento. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, y remite al modelo base para esa información.

La innovación técnica del paquete es la cadena de exportación a MNN y la estrategia de cuantización: HQQ (Half-Quadratic Quantization) de 4 bits con grupos de 128 y esquema asimétrico para las capas del transformer, HQQ de 8 bits para la cabeza de salida y un fichero independiente de incrustaciones en BF16. El grafo se construye con MNN 3.6.2 (commit `a197d757c7bb878ece416ea5bf37cec6773d6577`) y opciones `MNN_BUILD_LLM`, `MNN_LOW_MEMORY` y `MNN_SUPPORT_TRANSFORMER_FUSE`. Los artefactos de exportación se generaron a partir del commit `b0239771b07b317a258fbc384683bbd540741406` y se revalidaron contra el runtime actual sin reexportar.

## Capacidades

- Generación de texto conversacional en inglés, con formato instructivo y plantilla de chat propia de Gemma.
- Aritmética simple y tareas deterministas de respuesta corta (verificadas por el autor con decodificación greedy).
- Traducción de entradas cortas; la traducción larga presenta fallos documentados (ver limitaciones).
- Razonamiento básico de un solo turno; no hay evidencia de soporte fiable de cadenas multi-paso largas en este paquete.
- Soporte de tool calling / function calling: no disponible (no documentado ni verificado para este artefacto).
- Soporte de agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.
- Multilingüismo: limitado al inglés según la model card; no se declaran otros idiomas.

## Casos de uso

- Aplicaciones de escritorio offline con inferencia en CPU: el paquete está configurado por defecto para CPU con 4 hilos y `memory=low`, de modo que puede integrarse en una app de escritorio que necesite un asistente de texto sin conexión ni GPU.
- Prototipos en Android mediante MNN: al ser un grafo MNN, encaja en el runtime móvil de Alibaba para demos de chat en dispositivo; conviene validar antes el rendimiento en ARM, que el autor no ha verificado.
- Respuestas deterministas de dominio acotado (FAQ, cálculos sencillos, conversión de unidades): los casos de aritmética y saludos deterministas están verificados con decodificación greedy, por lo que son adecuados para flujos donde la respuesta debe ser reproducible.
- Traducción de frases cortas en pipelines de preprocesado: el autor confirma que la traducción corta funciona, lo que permite usarla para normalizar textos breves antes de otro proceso.
- Entornos con memoria muy limitada: la combinación de HQQ 4-bit, incrustaciones BF16 separadas y `memory=low` reduce la huella frente a una carga FP16, útil en máquinas sin GPU.
- Evaluación comparativa de motores de inferencia: sirve como referencia para medir latencia y calidad de MNN frente a llama.cpp u otros runtimes sobre el mismo modelo base.
- Base para experimentos de cuantización: el repositorio incluye `export_args.json` y `refresh_metadata.json`, lo que facilita reproducir o modificar la receta de exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas cualitativas de validación: alineación de mapeo FP32 en x86_64, cuatro casos de conversación deterministas correctos con greedy/high/8 hilos, y aceptación manual del fallo conocido en traducción larga. No se aportan cifras de MMLU, HumanEval, GSM8K ni métricas de throughput o latencia; el rendimiento en ARM FP16, GPU y contexto máximo queda explícitamente sin verificar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración por defecto, que es CPU; no se publican cifras de VRAM para ejecución en GPU.
- Memoria del repositorio: 11,3 GB de descarga completa (grafo, pesos, tokenizador y configuración deben descargarse como un todo).
- GPU recomendadas: no disponible; el autor no ha validado ejecución en GPU.
- CPU: configuración por defecto con 4 hilos y `precision=low`; la validación se hizo en x86_64.
- Dispositivos móviles: el autor indica que ARM FP16 en teléfono no está verificado.
- Cabe en GPU de consumo: no confirmado; la cuantización HQQ 4-bit sugiere una huella teórica manejable, pero no hay medición publicada.
- Opciones de despliegue: runtime MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`; no se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `taobao-mnn/gemma-7b-it-MNN` | 7B | no disponible | MNN, HQQ 4/8-bit | Gemma | Conversión para CPU/móvil; precisión degradada documentada |
| `google/gemma-7b-it` | 7B | 8.192 tokens (según el modelo base de Google; no verificado en este paquete) | safetensors, FP16/BF16 | Gemma | Modelo original instructivo, referencia de calidad |
| Conversiones GGUF de Gemma 7B (p. ej. familias llama.cpp) | 7B | depende del runtime | GGUF, Q4/Q5/Q8 | Gemma | Alternativa de despliegue en CPU con ecosistema más amplio; no se dispone de comparación medida con este paquete |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta conversión frente al modelo original ni frente a otras cuantizaciones; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Precisión degradada declarada por el autor: la traducción larga por defecto responde "Bonjour" y después entra en una contradicción con rechazo; el paquete se acepta "por utilidad global" sin garantizar que todas las instrucciones o entradas largas sean correctas.
- El propio autor advierte que no se garantiza el funcionamiento correcto en todas las instrucciones ni en entradas largas.
- Contexto máximo no verificado: no hay validación de la ventana de contexto efectiva en este artefacto.
- Sin verificación en ARM FP16, GPU ni rendimiento en móvil; las cifras de latencia no existen.
- Idiomas: solo inglés declarado; el uso en castellano no está soportado ni evaluado.
- Riesgo de alucinación: inherente al modelo base de 7B y acentuado por la cuantización de 4 bits; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados en esta model card; deben asumirse los del modelo base de Google, no evaluados aquí.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google y a la política de uso prohibido; el repositorio no incluye fichero LICENSE y la conversión no amplía los permisos del modelo original.
- Integridad del paquete: grafo, pesos, tokenizador y configuración deben usarse de la misma revisión; mezclar revisiones o cachés antiguas puede romper la inferencia.
- El fichero `llm.mnn.json` incluido es un registro del grafo antiguo, no la descripción del grafo nuevo; no debe usarse como referencia de arquitectura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/gemma-7b-it-MNN
- Modelo base: https://huggingface.co/google/gemma-7b-it
- Pesos originales en ModelScope: https://modelscope.cn/models/AI-ModelScope/gemma-7b-it/summary
- Motor MNN (GitHub): https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia Gemma: https://www.kaggle.com/models/google/gemma/license/consent/verify/huggingface?returnModelRepoId=google/gemma-7b-it
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
