# XinShu3047/SKC-checkpoints

## Resumen

SKC-checkpoints es un repositorio que publica los checkpoints por etapas del método **Selective Knowledge Control (SKC)**, una técnica ligera de aprendizaje continuo para agentes de interfaz gráfica (GUI). El modelo base es **UI-TARS-1.5-7B** de ByteDance, un modelo de visión-lenguaje (VLM) de 7 mil millones de parámetros especializado en comprensión y actuación sobre interfaces gráficas. El proyecto, desarrollado por XinShu3047, entrena el modelo sobre un flujo secuencial de ocho aplicaciones de escritorio (VLC, Thunderbird, LibreOffice, GIMP, VSCode y Chrome) para que el agente aprenda a interactuar con ellas sin olvidar las habilidades adquiridas en etapas anteriores.

La relevancia de este trabajo radica en abordar el problema del **olvido catastrófico** en agentes GUI: cuando un modelo se entrena en una nueva aplicación, tiende a degradar su rendimiento en las anteriores. SKC controla las actualizaciones de los pesos en direcciones históricamente importantes, preservando el conocimiento previo mientras aprende nuevas tareas. El repositorio contiene ocho checkpoints independientes, cada uno correspondiente a una etapa del flujo de entrenamiento, y está pensado para la evaluación reproducible de métodos de aprendizaje continuo en entornos de uso de computador (computer use).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje (VLM) basado en UI-TARS-1.5-7B |
| Parametros totales | 7 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de UI-TARS-1.5-7B, no especificado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (UI-TARS-1.5-7B soporta principalmente inglés, no se especifica) |
| Licencia | no disponible (no se indica en la model card) |
| Formato de pesos | safetensors (checkpoints de Transformers) |

## Arquitectura y entrenamiento

El modelo parte de **UI-TARS-1.5-7B**, un VLM que combina un codificador visual con un decoder de lenguaje, diseñado para tareas de comprensión de interfaces y actuación (grounding visual, razonamiento espacial y generación de acciones). SKC aplica un enfoque de aprendizaje continuo por etapas: se entrena el modelo en la primera aplicación (VLC) sin estado histórico, luego se construye un "estado de protección" a partir de trayectorias exitosas y del checkpoint completado, y en las siguientes aplicaciones se activa SKC para restringir las actualizaciones de pesos en direcciones importantes del espacio de parámetros. Tras cada etapa, el nuevo estado se fusiona con el histórico y se continúa con la siguiente aplicación.

El entrenamiento se apoya en la infraestructura **DART-GUI** (extendida para SKC), el framework **verl** para RL y **vLLM** para servir los modelos durante el rollout. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO; la model card solo indica que se usan trayectorias exitosas para construir el estado de protección. Los checkpoints publicados contienen únicamente los pesos del modelo, sin los artefactos intermedios de SKC (trayectorias, bases de datos, logs, imágenes de entorno).

## Capacidades

- **Actuación sobre interfaces gráficas**: el modelo puede interpretar capturas de pantalla y generar acciones (clics, teclado, scroll) para operar aplicaciones de escritorio.
- **Aprendizaje continuo multi-aplicación**: gracias a SKC, mantiene el conocimiento de aplicaciones anteriores mientras aprende nuevas, mitigando el olvido catastrófico.
- **Razonamiento visual y espacial**: hereda las capacidades de UI-TARS-1.5-7B para localizar elementos en la pantalla y razonar sobre su disposición.
- **Generación de secuencias de acciones**: puede producir comandos de alto nivel para entornos de computer use (p. ej., OSWorld).
- **Soporte de agentes**: diseñado para integrarse en pipelines de agentes GUI con observación visual y ejecución de acciones.
- **Multilingüe**: no confirmado; se asume que hereda las capacidades del modelo base, pero no hay datos específicos.

## Casos de uso

- **Automatización de tareas de oficina**: el modelo puede operar LibreOffice Writer, Impress y Calc para generar documentos, presentaciones y hojas de cálculo a partir de instrucciones en lenguaje natural, gracias a su entrenamiento específico en estas aplicaciones.
- **Pruebas de software (QA)**: al poder interactuar con VSCode y Chrome, puede ejecutar flujos de prueba en aplicaciones web y de escritorio, verificando comportamientos esperados y reportando errores.
- **Asistente de escritorio personal**: un agente que ayuda al usuario a gestionar el correo (Thunderbird), reproducir medios (VLC) o editar imágenes (GIMP) mediante comandos conversacionales.
- **Investigación en aprendizaje continuo**: los checkpoints por etapas permiten reproducir experimentos de evaluación de métodos de mitigación de olvido en agentes GUI, comparando el rendimiento en cada aplicación a lo largo del flujo.
- **Desarrollo de agentes computer use**: sirve como punto de partida para sistemas que necesitan operar múltiples aplicaciones de forma secuencial, como asistentes de productividad o RPA (automatización robótica de procesos).
- **Evaluación de robustez en entornos reales**: al estar entrenado en aplicaciones concretas, puede usarse en benchmarks como OSWorld para medir la capacidad de generalización a tareas no vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (p. ej., tasa de éxito en OSWorld, precisión de grounding, etc.) ni comparaciones con otros métodos de aprendizaje continuo. Se espera que el paper asociado (próximamente) proporcione estos datos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 7B en FP16, se necesitan aproximadamente 14 GB de VRAM. Con cuantización a 4 bits (si se aplicara), podría reducirse a unos 4-6 GB, pero no se ofrecen versiones cuantizadas.
- **GPU recomendadas**: una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A10G, L4) para inferencia en FP16. Para entrenamiento o fine-tuning adicional, se recomienda A100 (40 GB) o H100.
- **Compatibilidad con GPU de consumo**: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo en FP16, aunque con limitaciones de velocidad si se procesan imágenes de alta resolución.
- **Opciones de despliegue**: al ser un checkpoint de Transformers, puede servirse con vLLM, TGI o directamente con la API de Transformers. Para entornos de computer use, se integra con el servicio de rollout de DART-GUI.
- **Latencia y throughput**: no disponibles; dependen del hardware, la resolución de las capturas de pantalla y el número de pasos de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **SKC-checkpoints** (este) | 7B | no disponible | Aprendizaje continuo para GUI | no disponible | Checkpoints públicos en HF |
| **UI-TARS-1.5-7B** (base) | 7B | no disponible | Agente GUI general | no disponible | Público en HF |
| **DART-GUI** (infraestructura) | - | - | Framework de entrenamiento para agentes GUI | no disponible | Código abierto en GitHub |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo base es que SKC-checkpoints está fine-tuneado en una secuencia de aplicaciones específicas, lo que debería mejorar su capacidad en esas aplicaciones a costa de una posible pérdida de generalidad en otras. No hay información sobre otros modelos de la misma categoría (p. ej., agentes GUI basados en otros VLM como CogAgent o SeeClick).

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo ni del repositorio, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de usarlo en producción.
- **Alcance limitado a aplicaciones concretas**: el entrenamiento se centra en ocho aplicaciones de escritorio; el rendimiento en otras aplicaciones o entornos web no está garantizado.
- **Riesgo de alucinación y errores de actuación**: como todo agente GUI, puede generar acciones incorrectas o interpretar mal las capturas de pantalla, especialmente en situaciones no vistas durante el entrenamiento.
- **Sesgos potenciales**: al no disponer de información sobre la composición del dataset de entrenamiento, no se pueden evaluar sesgos de género, idioma o culturales.
- **Falta de benchmarks**: sin métricas publicadas, no es posible validar su eficacia frente a otros métodos de aprendizaje continuo.
- **Dependencia del modelo base**: las limitaciones de UI-TARS-1.5-7B (p. ej., idiomas soportados, robustez visual) se heredan en este modelo.
- **Tamaño del repositorio**: 663.4 GB, lo que requiere un ancho de banda y almacenamiento considerables para descargar todos los checkpoints.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/XinShu3047/SKC-checkpoints
- Código de SKC (GitHub): https://github.com/shzirui/SKC
- Infraestructura DART-GUI: https://github.com/computer-use-agents/dart-gui
- Modelo base UI-TARS-1.5-7B: https://huggingface.co/ByteDance-Seed/UI-TARS-1.5-7B
- Checkpoints adicionales (relacionados): https://huggingface.co/XinShu3047/gui-checkpoints
