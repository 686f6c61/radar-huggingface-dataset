# starry0929/pi05_s1_stack_cups_real78_random200_20261026_step10000_pytorch

## Resumen

Este repositorio contiene un checkpoint de política Vision-Language-Action (VLA) derivado de π0.5 (Pi0.5), el modelo de robótica de Physical Intelligence, y ajustado por el usuario `starry0929` sobre 200 episodios renderizados del conjunto "real78" para una tarea concreta de apilado de vasos ("stack cups") en su entorno S1. No es un modelo de lenguaje general, sino una política de control: recibe tres imágenes de cámara más un prompt de lenguaje y emite secuencias de 22 acciones articulares absolutas a 30 Hz.

El interés técnico del artefacto es doble. Por un lado, es un export a PyTorch BF16 de un checkpoint JAX (EMA, paso 10 000) verificado por el autor, lo que permite ejecutar la política fuera del ecosistema JAX de OpenPI. Por otro, la model card documenta explícitamente el resultado de la evaluación closed-loop nativa en JAX: 4/10 éxitos en episodios de entrenamiento y 0/10 en episodios no vistos dentro del rango, un dato que acota con precisión su utilidad real.

El modelo tiene 3 616 757 520 parámetros (~3,6 B) y el repositorio ocupa 7,2 GB. Se publica sin licencia declarada, sin idiomas declarados y sin métricas de benchmarks convencionales. Su relevancia práctica es la de un caso de estudio reproducible de fine-tuning completo de π0.5 sobre datos propios y de portabilidad JAX→PyTorch, no la de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (backbone de lenguaje/visión + expert de acciones con denoising iterativo); export a PyTorch desde JAX |
| Parametros totales | 3 616 757 520 (~3,6 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; el repositorio solo distribuye pesos BF16 |
| Idiomas soportados | no disponibles (el prompt de condicionamiento es textual; no se declara cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, export PyTorch de un checkpoint JAX) |

Otros datos operativos declarados en la model card: horizonte de 50 pasos, frecuencia de 30 Hz, 10 pasos de denoising, 22 articulaciones con acciones absolutas nativas, tres cámaras RGB a 224×126 con 49 filas negras por encima y por debajo (entrada efectiva 224×224 con letterbox), y un array `state32` que el adaptador transporta pero que no se usa como condicionamiento en esta configuración "prompt-only".

## Arquitectura y entrenamiento

π0.5 es una política VLA que combina un backbone visión-lenguaje (codificador visual tipo SigLIP más un modelo de lenguaje) con un "action expert" que genera las acciones mediante un proceso iterativo de denoising —en este checkpoint, 10 pasos— condicionado por las imágenes y el prompt. La salida son 22 acciones articulares absolutas, emitidas en bloques con horizonte de 50 y ejecutadas a 30 Hz. El autor indica que el modelo es un fine-tuning completo ("fresh full fine-tuning") desde el π0.5 base oficial, no un LoRA, sobre 200 episodios renderizados de "real78" para su GUI S1.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (en una política de acción estos términos no aplican del mismo modo que en un LLM). La innovación destacable es de ingeniería: un export BF16 a PyTorch de un checkpoint JAX con EMA, con inferencia en CPU validada, manteniendo el contrato nativo de observaciones (tres cámaras con aspect ratio preservado mediante padding) y de acciones.

## Capacidades

- Control robótico de manipulación: genera secuencias de 22 acciones articulares absolutas a partir de observaciones visuales, con horizonte de 50 pasos y 30 Hz.
- Condicionamiento por prompt de lenguaje: la política se dirige mediante instrucciones textuales (configuración prompt-only).
- Percepción multivista: consume tres cámaras RGB simultáneas con preprocesado fijo de 224×126 más padding a 224×224.
- Ejecución de políticas VLA en PyTorch: permite inferencia sin el stack JAX de OpenPI, incluida ejecución en CPU validada por el autor.
- Integración con pipelines de ejecución asíncrona: compatible con esquemas tipo RTC (real-time chunking) usados en demos de π0.5 sobre brazos Piper.
- Tarea específica aprendida: apilado de vasos en el entorno S1 del autor.
- No soporta (según la información disponible): tool calling, uso como agente conversacional, razonamiento multi-paso textual, visión general, audio, ni modo "thinking".

## Casos de uso

- Apilado de vasos en el banco de pruebas del autor: es el caso para el que fue entrenado; usaría las tres cámaras y un prompt de instrucción para emitir bloques de 50 acciones a 30 Hz sobre el robot S1.
- Reproducción de experiments JAX→PyTorch: sirve para verificar que una política exportada a BF16 reproduce el comportamiento del checkpoint JAX original en inferencia, incluyendo ejecución en CPU sin GPU.
- Base para fine-tuning adicional: al ser un ajuste completo desde π0.5 base, puede actuar como punto de partida para especializar la política en una tarea nueva con pocos centenares de episodios.
- Docencia e investigación en VLA: permite estudiar el efecto de un dataset pequeño (200 episodios) sobre la generalización, con una métrica closed-loop ya publicada (4/10 train, 0/10 unseen).
- Evaluación de robustez y recuperación: integrable en montajes tipo Piper + RTC para analizar si la política recupera tras el colapso de una pila, como en las demos públicas de π0.5.
- Referencia negativa para políticas de producción: útil como caso documentado de sobreajuste al entorno de entrenamiento, para calibrar expectativas antes de desplegar políticas VLA en línea.
- Pruebas de integración de pipelines de inferencia: al estar en safetensors BF16, encaja en servidores de inferencia propios para medir latencia de los 10 pasos de denoising con entrada multivista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación es closed-loop nativo en JAX:

| Evaluación | Entorno | Resultado |
|---|---|---|
| Closed-loop nativo JAX | Episodios de entrenamiento | 4/10 éxitos |
| Closed-loop nativo JAX | Episodios no vistos dentro de rango | 0/10 éxitos |
| Inferencia del export | CPU, export PyTorch | superada (sin métrica de éxito) |

El autor advierte explícitamente de que la inferencia en CPU del export no establece éxito closed-loop en PyTorch ni en robot real.

## Requisitos de hardware

- VRAM estimada: ~7,2 GB solo para pesos BF16; con activaciones y tres flujos de imagen, presupuestar 10-12 GB para inferencia cómoda.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue por lotes o entrenamiento; L40S y RTX 4090 (24 GB) suficientes para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y previsiblemente en tarjetas de 12-16 GB según el runtime; el autor valida además inferencia en CPU.
- Opciones de despliegue: script de inferencia propio sobre PyTorch con safetensors; el ecosistema de referencia es OpenPI (JAX) y sus adaptadores, más herramientas de ejecución asíncrona tipo RTC. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles. Como referencia de diseño, la política opera a 30 Hz con horizonte de 50 y 10 pasos de denoising por bloque, lo que exige que cada bloque se genere en menos de ~1,67 s para sostener el lazo abierto; la ejecución en CPU valida corrección, no tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`starry0929/pi05_s1_stack_cups_real78_random200_...step10000_pytorch`) | ~3,6 B | no disponible | 4/10 train, 0/10 unseen (JAX) | no disponible | safetensors BF16, 7,2 GB |
| `HITdongdong/pi05_s1_stack_cups_refined96_20261017_step49999_pytorch` | ~4 B | no disponible | sin claims de rendimiento | no disponible | safetensors BF16, repo de checkpoint |
| `starry0929/pi05_s1_stack_cups_all111_initial_focus_resume_v3_...step30000_pytorch` | no disponible | no disponible | no disponible | no disponible | safetensors, adaptador portable del release padre |
| π0.5 base (Physical Intelligence, openpi) | no disponible en la información | no disponible | no disponible | según OpenPI | OpenPI (JAX) |

Las tres variantes son fine-tunings del mismo π0.5 sobre subconjuntos distintos de episodios "stack cups"; ninguna declara licencia ni benchmarks comparables, por lo que la elección entre ellas solo puede hacerse por el número de episodios y el paso de entrenamiento, no por calidad medida.

## Limitaciones y advertencias

- Generalización prácticamente nula: 0/10 éxitos en episodios no vistos dentro del rango, según la propia model card. No es un modelo desplegable en entornos nuevos.
- Sin validación en robot real: el autor afirma que no se incluye control de robot ni se establece éxito real; la única validación del export es de corrección en CPU.
- No condiciona sobre propriocepción: el array `state32` se transporta pero no se usa en esta configuración prompt-only, lo que limita la reactividad ante perturbaciones.
- Sobreajuste al renderizado: entrenado sobre episodios renderizados de "real78", con entrada 224×126 letterboxed; cambios de cámara, iluminación o resolución pueden degradar la política.
- Acciones ligadas a una morfología concreta: 22 articulaciones absolutas, 30 Hz y horizonte 50; no es portable a otro robot sin reentrenamiento.
- Licencia no declarada: la ausencia de licencia impide asumir derechos de uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: la política puede generar trayectorias aparentemente válidas que fallen físicamente; requiere límites de par, paradas de emergencia y supervisión.
- Sesgos: no documentados, pero el dataset procede de un único entorno, un único operador y una única tarea, por lo que hereda sus sesgos de posicionamiento y apariencia.
- Idiomas y contexto: no declarados; el prompt de lenguaje no debe asumirse multilingüe.
- Reproducibilidad: el repositorio contiene solo el checkpoint, no el dataset, el servidor de inferencia ni el código de entrenamiento.
- Sin métricas de latencia: el lazo a 30 Hz con 10 pasos de denoising no está caracterizado en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/starry0929/pi05_s1_stack_cups_real78_random200_20261026_step10000_pytorch
- Checkpoint hermano (refined96, step 49999): https://huggingface.co/HITdongdong/pi05_s1_stack_cups_refined96_20261017_step49999_pytorch
- Checkpoint hermano del mismo autor (all111, step 30000): https://huggingface.co/starry0929/pi05_s1_stack_cups_all111_initial_focus_resume_v3_20261019_step30000_pytorch
- OpenPI (Physical Intelligence), documentación del sistema: https://deepwiki.com/Physical-Intelligence/openpi
- Demo de π0.5 sobre brazo AgileX Piper con ejecución RTC: https://github.com/jensen26443/piper-pi05-demo
- Utilidades de fine-tuning de π0.5: https://github.com/std-song/finetune-pi05/tree/main/
