# SSO09/banglabert-toxic-detector

## Resumen

BanglaBERT Toxic & Harassment Comment Detector es un modelo de clasificación de texto en bengalí desarrollado por Shaiera Sultana Oishe (usuario SSO09 en Hugging Face). Se trata de un ajuste fino (fine-tuning) del modelo base `csebuetnlp/banglabert`, una arquitectura ELECTRA preentrenada específicamente para bengalí, sobre un corpus de 50.281 comentarios reales de redes sociales. El modelo resuelve una tarea de clasificación binaria: distinguir entre contenido no tóxico (etiqueta 0) y contenido tóxico o de acoso (etiqueta 1), con un enfoque declarado en la protección de mujeres frente al acoso digital.

Con 110.618.882 parámetros, es un modelo compacto y ligero (repo de 0,4 GB en safetensors) que puede desplegarse en hardware modesto. Su relevancia radica en cubrir un nicho poco atendido: la moderación automática de contenido en bengalí, un idioma con más de 230 millones de hablantes nativos y una presencia creciente en plataformas sociales, pero con escasez de herramientas de moderación específicas.

El modelo se publica bajo licencia MIT, lo que facilita su integración en productos comerciales y flujos de moderación asistida. Está disponible exclusivamente para la tarea de clasificación de texto y opera únicamente en bengalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (base: `csebuetnlp/banglabert`) |
| Parametros totales | 110.618.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BanglaBERT; típicamente 512 tokens en ELECTRA, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantización posible vía herramientas externas) |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ELECTRA, una arquitectura de transformer que sustituye el enmascaramiento de tokens clásico por un enfoque de detección de tokens reemplazados (replaced token detection), lo que mejora la eficiencia del preentrenamiento. El punto de partida es `csebuetnlp/banglabert`, un ELECTRA preentrenado sobre grandes volúmenes de texto en bengalí. Sobre esa base se añade una cabeza de clasificación de secuencias con dos etiquetas y se ajusta para la tarea de toxicidad.

El ajuste fino se realizó sobre un conjunto de 50.281 comentarios reales de redes sociales en bengalí, con una partición de evaluación de 5.029 muestras no vistas. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a clasificadores). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de texto en bengalí: distingue entre contenido no tóxico (0) y tóxico o de acoso (1).
- Detección de toxicidad, ciberacoso y discurso de odio en comentarios de redes sociales.
- Detección de lenguaje ofensivo dirigido a personas, con foco declarado en el acoso contra mujeres.
- Salida con probabilidades por clase mediante softmax, lo que permite umbrales de decisión ajustables.
- Integración con la librería `transformers` y el pipeline `text-classification`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al bengalí.

## Casos de uso

- Moderación asistida de comentarios en plataformas sociales bengalíes: el modelo clasifica cada comentario entrante y permite filtrar o marcar automáticamente el contenido tóxico antes de la revisión humana, reduciendo la carga de los moderadores.
- Extensiones de navegador para seguridad online: al ser un modelo compacto (110 M de parámetros, 0,4 GB), puede integrarse en una extensión que resalte o advierta sobre comentarios abusivos en tiempo real en el navegador del usuario.
- Protección de comunidades de mujeres en foros y redes: el modelo permite priorizar la detección de acoso dirigido a mujeres, tal como declara su propósito, para escalar esos casos a revisión humana con mayor rapidez.
- Filtrado previo en secciones de comentarios de medios de comunicación bengalíes: se puede usar como primera capa de un sistema de moderación que derive los casos dudosos a revisores humanos, dado que la propia model card recomienda su uso junto con moderación humana.
- Investigación sobre toxicidad en línea en bengalí: el modelo sirve como herramienta de anotación automática o como línea base en estudios sobre discurso de odio y acoso en el ecosistema digital bengalí.
- Enriquecimiento de datasets para entrenamiento de modelos mayores: las predicciones del modelo pueden usarse para preetiquetar grandes volúmenes de comentarios y acelerar la construcción de corpus anotados.

## Benchmarks y rendimiento

Evaluado sobre un conjunto de test no visto de 5.029 muestras, según la model card:

| Metrica | Valor |
|---|---|
| Accuracy | 90,91 % |
| Macro F1 | 90,91 % |
| Macro Precision | 90,95 % |
| Macro Recall | 91,00 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para pesos (110 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- En FP16: aproximadamente 0,22 GB para pesos; en cuantización de 8 bits, alrededor de 0,11 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, GTX 1660, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir grandes volúmenes de comentarios; para uso individual, cualquier GPU moderna es suficiente.
- Opciones de despliegue: `transformers` con PyTorch, `pipeline` de Hugging Face, TorchServe, ONNX Runtime, TGI (Text Generation Inference no aplica a clasificación, pero se puede servir con frameworks de clasificación), y conversión a GGUF para llama.cpp no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSO09/banglabert-toxic-detector | 110,6 M | no disponible | Clasificación de toxicidad en bengalí | MIT | Hugging Face |
| csebuetnlp/banglabert | ~110 M | 512 (típico en ELECTRA) | Modelo base de lenguaje bengalí | MIT (según repo original) | Hugging Face |
| Modelos multilingües de toxicidad (p. ej., variantes de XLM-R) | 270 M–560 M | 512 | Clasificación de toxicidad multilingüe | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada. La comparativa se limita a parámetros, contexto y licencia; los valores de contexto del modelo base no están confirmados en la documentación del autor.

## Limitaciones y advertencias

- El modelo puede producir falsos positivos con dialectos coloquiales, sátira y sarcasmo, según advierte la propia model card.
- Está entrenado exclusivamente en bengalí; no funciona con otros idiomas.
- Es un clasificador binario: no distingue grados de toxicidad ni categorías específicas (insulto, amenaza, acoso sexual, etc.).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en contextos ambiguos o ironía.
- La model card recomienda explícitamente su uso junto con flujos de moderación humana; no debe usarse como único mecanismo de decisión en producción.
- No se documentan sesgos específicos del dataset de entrenamiento (composición demográfica, origen de los comentarios), lo que dificulta evaluar su comportamiento en subpoblaciones.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base `csebuetnlp/banglabert` antes de redistribuir derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validación comunitaria independiente.
- No se especifica la longitud máxima de secuencia soportada en la model card; textos largos pueden truncarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SSO09/banglabert-toxic-detector
- Modelo base BanglaBERT: https://huggingface.co/csebuetnlp/banglabert
- Repositorio de BanglaBERT (paper y código): no disponible en la información proporcionada
- Paper de ELECTRA: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
