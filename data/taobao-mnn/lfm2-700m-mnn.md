# taobao-mnn/LFM2-700M-MNN

## Resumen

LFM2-700M-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-700M, desarrollado por Liquid AI y adaptado por el equipo taobao-mnn (vinculado a Alibaba MNN). El modelo original es un LM de 700 millones de parámetros con arquitectura híbrida (no un transformer denso convencional) orientado a inferencia en dispositivo (edge), conversación y generación de texto en chino e inglés. Esta variante concreta resuelve el problema de ejecutar el modelo en CPU sin GPU, mediante cuantización HQQ de 4 bits con grupo de 64 y escalas en FP16, empaquetada en el formato propietario de MNN (`llm.mnn`, `llm.mnn.weight`, `tokenizer.mtok`).

La relevancia actual es práctica: permite desplegar un LM de 700M en hardware modesto (CPU, 4 hilos, configuraciones `precision=low` y `memory=low`) con un consumo de disco de aproximadamente 0,9 GB, lo que lo hace apto para aplicaciones de escritorio, móvil o entornos sin acelerador. El repositorio incluye la configuración de ejecución, el tokenizador y los pesos cuantizados, además de instrucciones de compilación del runtime MNN con soporte LLM y fusión de transformadores.

No se dispone de información sobre el contexto máximo, los datos de entrenamiento ni benchmarks en la documentación proporcionada; la ficha refleja únicamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (modelo base LiquidAI/LFM2-700M); capas del modelo de lenguaje: 16, dimensión oculta 1536 |
| Parametros totales | 700M (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit con grupo de 64; escalas de cuantización en FP16; embeddings compartidos con la cabeza de salida en 4-bit |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1-0); uso comercial sujeto a la sección 5 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok`, configuración `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2-700M emplea una arquitectura híbrida según la model card del adaptador; no se detalla en la información disponible la composición exacta de capas (atención, convoluciones o SSM) ni la proporción entre ellas. La versión MNN conserva 16 capas y una dimensión oculta de 1536, y aplica cuantización HQQ de 4 bits con grupo de 64 a las capas lineales del modelo de lenguaje y a la cabeza de salida, manteniendo las escalas en FP16. Los embeddings de tokens comparten los pesos de 4 bits con la cabeza de salida, lo que reduce el tamaño del artefacto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal, etc.) más allá de la propia naturaleza híbrida del modelo original. El empaquetado MNN incluye soporte de fusión de transformadores (`MNN_SUPPORT_TRANSFORMER_FUSE`) y modo de baja memoria (`MNN_LOW_MEMORY`), y requiere una versión del runtime con la corrección de plantilla Jinja y tokens especiales (PR #5155 de alibaba/MNN).

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Conversación multi-turno (el repositorio incluye ejemplos de saludo y presentación).
- Aritmética básica y traducción, verificadas en las pruebas de humo del 2026-11-17 sobre CPU x64.
- Inferencia en CPU sin GPU, con configuraciones de baja precisión y baja memoria.
- Ejecución mediante el runtime MNN en entornos de escritorio y dispositivos edge.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales en aplicaciones de escritorio: el modelo puede integrarse mediante MNN en una app nativa y gestionar diálogos multi-turno en CPU con 4 hilos, sin depender de servicios en la nube.
- Traducción y respuestas bilingües chino-inglés: adecuado para interfaces que atienden a usuarios de ambos idiomas, con la ventaja de un artefacto de menos de 1 GB.
- Pruebas de humo y validación de pipelines MNN: útil como modelo de referencia para verificar la integración de LLM en el runtime (plantillas Jinja, tokens especiales, fusión de transformadores) antes de desplegar modelos mayores.
- Aplicaciones móviles o embebidas con recursos limitados: el tamaño reducido y la cuantización HQQ 4-bit permiten incluirlo en paquetes de aplicación o en dispositivos con poca memoria.
- Generación de texto offline en entornos aislados: al no requerir GPU ni conectividad, encaja en escenarios de privacidad o conectividad intermitente.
- Prototipado rápido de funcionalidades de chat: el binario `llm_demo` y la configuración incluida permiten levantar una demo funcional con pocos comandos y evaluar la calidad del modelo base antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pruebas de humo cualitativas (alineación de mapeo FP32, saludo, aritmética y traducción) superadas el 2026-11-17 en CPU x64 con la configuración por defecto; no se aportan métricas de latencia ni throughput.

## Requisitos de hardware

- Tamaño del repositorio: aproximadamente 0,9 GB, lo que acota el espacio en disco y la memoria necesaria para cargar los pesos.
- Inferencia en CPU: configuración por defecto de 4 hilos, `precision=low` y `memory=low`, según la model card.
- GPU: no se especifican GPU recomendadas; el artefacto está orientado a CPU mediante MNN.
- Cabe en hardware consumer sin GPU dedicada; no se documentan requisitos de VRAM porque el despliegue previsto es en CPU.
- Opciones de despliegue: runtime MNN (`llm_demo`) compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-700M-MNN (este) | 700M | no disponible | MNN, HQQ 4-bit | LFM Open License v1.0 | Optimizado para CPU/edge con runtime MNN |
| LiquidAI/LFM2-700M | 700M | no disponible | safetensors (pesos originales) | LFM Open License v1.0 | Modelo base sin cuantizar; requiere framework estándar |
| Alternativas de 700M-1B para edge | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría; la comparación se limita a la relación con el modelo base.

## Limitaciones y advertencias

- La cuantización HQQ 4-bit introduce pérdida de precisión respecto al modelo base; la calidad en tareas complejas puede degradarse.
- Solo se declaran chino e inglés; el rendimiento en otros idiomas no está garantizado.
- No se documenta la longitud de contexto, por lo que no se puede asumir soporte de ventanas largas.
- Riesgo de alucinación inherente a un LM de 700M; no apto para tareas que exijan alta fiabilidad factual sin verificación.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial (sección 5); es necesario revisarlas antes de desplegar en producción.
- El formato MNN es específico del runtime de Alibaba; no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp.
- Requiere una versión del runtime MNN con la corrección de plantilla Jinja y tokens especiales (PR #5155); versiones anteriores pueden producir salidas incorrectas.
- No hay datos publicados de benchmarks ni de sesgos; la evaluación en producción debe hacerse con pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-700M-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-700M
- ModelScope: https://modelscope.cn/models/MNN/LFM2-700M-MNN
- Runtime MNN: https://github.com/alibaba/MNN
- PR de MNN con plantilla Jinja y corrección de tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
