# ssg1/doc-compass

## Resumen

Doc Compass es un sistema de clasificacion de texto desarrollado por el usuario ssg1 (repositorio `ssg1/doc-compass`) que enruta una preocupacion de salud expresada en lenguaje coloquial hacia un tipo de especialista medico concreto. No diagnostica ni ofrece consejo medico: se limita a sugerir "una puerta a la que llamar" entre 12 categorias (Dermatologia, Traumatologia, Otorrinolaringologia, Gastroenterologia, Neurologia, Urologia, Ginecologia-Obstetricia, Salud mental, Cardiologia, Oftalmologia, Odontologia y "Empezar por un medico de cabecera").

El nucleo del sistema es un ajuste fino completo (todos los pesos) de `distilbert/distilroberta-base`, un transformer encoder destilado, para clasificacion de etiqueta unica en 12 clases. El repositorio incluye ademas un router alternativo basado en TF-IDF mas regresion logistica entrenado desde cero sobre los mismos datos, reglas de emergencia, logica de explicacion y una aplicacion Gradio de demostracion. Segun la model card, solo se ha completado la "Stage 1" del proyecto.

Su relevancia es acotada: es un ejercicio de routing sanitario no validado clinicamente, en ingles y entrenado sobre comentarios muy cortos, con descargas y valoraciones nulas en el momento de redactar esta ficha. Resulta util como referencia de clasificacion de dominios medicos y como ejemplo de pipeline dual (neuronal + clasico) dentro de un mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado (RoBERTa destilado, `distilroberta-base`) para el router neuronal; TF-IDF + regresion logistica para el router alternativo |
| Parametros totales | No disponible en la ficha (el modelo base `distilroberta-base` tiene aproximadamente 82 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base admite 512 posiciones, pero se entreno con comentarios de una sola frase |
| Tipos de cuantizacion | No disponible (pesos neuronales en safetensors; el router clasico usa joblib) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint `distilroberta_stage1`) y joblib (checkpoint `tfidf_stage1.joblib`) |

## Arquitectura y entrenamiento

El componente principal es un ajuste fino de todos los pesos de `distilroberta-base`, un transformer encoder de tipo RoBERTa destilado. La tarea es de clasificacion de texto de etiqueta unica sobre 12 categorias especializadas. En paralelo, el repositorio incluye un segundo router entrenado desde cero con vectorizacion TF-IDF y regresion logistica, lo que permite comparar un enfoque neuronal frente a uno lineal clasico sobre el mismo conjunto de datos. La model card indica explicitamente que solo se ha abordado la "Stage 1".

Los datos de entrenamiento proceden del conjunto publico *Patient Comments and Specialist Types* (Mendeley Data, DOI 10.17632/2twgjzpn82.2, licencia CC BY 4.0): 6.252 comentarios unicos, cortos y de una sola frase, con 68 categorias de sintomas originales remapeadas a las 12 etiquetas finales. La ficha no menciona uso de RLHF, DPO ni decodificacion especulativa. Como capa adicional de seguridad, el sistema incorpora un modulo de reglas de emergencia escrito manualmente, independiente del modelo.

## Capacidades

- Clasificacion de texto de etiqueta unica en 12 categorias medicas a partir de una descripcion breve.
- Routing de una queja de salud hacia un tipo de especialista (Dermatologia, Cardiologia, Salud mental, Odontologia, etc.).
- Deteccion de emergencias mediante reglas escritas, no mediante el modelo.
- Generacion de explicaciones asociadas a la clasificacion, integradas en la logica del proyecto.
- Interfaz de demostracion con Gradio incluida en el repositorio.
- Alternativa de inferencia con un router TF-IDF mas regresion logistica.
- No genera texto libre, no realiza razonamiento multi-paso, no soporta tool calling ni function calling y no procesa imagen, audio ni vision.
- Solo ingles; no se declaran capacidades multilingues.

## Casos de uso

- Orientacion inicial no diagnostica: el modelo recibe una frase como "me duele el pecho al respirar" y devuelve la categoria de especialista mas probable para que el usuario sepa a que puerta llamar.
- Triaje de formularios de admision: clasificacion automatica de comentarios de pacientes en un formulario web para preasignar un servicio antes de la cita, con revision humana obligatoria.
- Etiquetado de corpus para investigacion: anotacion de conjuntos de comentarios de pacientes segun especialidad, aprovechando las 12 etiquetas y la reproducibilidad del router TF-IDF incluido.
- Prefiltrado de bandejas de correo: clasificar mensajes libres dirigidos a un centro de salud para encaminarlos al equipo correspondiente, dado el bajo coste computacional del modelo.
- Prototipado de sistemas medicos: servir como linea base de clasificacion de dominios sanitarios sobre la que comparar modelos mayores antes de invertir en infraestructura.
- Educacion y divulgacion: demostracion en notebooks con la app Gradio para ilustrar las limitaciones de los clasificadores medicos entrenados sobre datos cortos.
- Comparacion de arquitecturas: uso del par router neuronal y router TF-IDF como banco de pruebas para decidir entre enfoques clasicos y neuronales en tareas de routing.

## Benchmarks y rendimiento

Evaluacion sobre 938 comentarios reservados del mismo conjunto publico de Mendeley Data:

| Metrica | Resultado | Intervalo / nota |
|---|---|---|
| Precision top-1 | 94,3 % | IC 95 %: 92,7 % - 95,7 % |
| Precision top-3 | 99,0 % | Sobre el mismo conjunto reservado |
| Macro-F1 | 0,908 | Sobre el mismo conjunto reservado |

La propia model card advierte que estos valores reflejan el ajuste al conjunto publico y no el comportamiento sobre textos mas largos o del mundo real. No se aportan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un encoder de este tamano cabe holgadamente en memoria de cualquier GPU moderna y puede ejecutarse en CPU. Las estimaciones concretas dependen del framework y de la cuantizacion, dato no especificado en la ficha.
- El repositorio ocupa aproximadamente 0,3 GB, lo que incluye pesos neuronales, el modelo TF-IDF en joblib y el codigo de la aplicacion.
- GPU recomendadas: innecesarias; el modelo puede correr en CPU. Cualquier GPU de consumo (por ejemplo, una RTX 3060 o superior) es mas que suficiente.
- Cabe en tarjetas de consumo: si, e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (libreria declarada en la ficha), integracion con `endpoints_compatible`, y la aplicacion Gradio incluida en el repositorio. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ssg1/doc-compass (router distilroberta) | Clasificacion de texto (12 clases) | No indicado (base de aproximadamente 82 M) | 512 posiciones del modelo base | Top-1 94,3 %, macro-F1 0,908 | Apache 2.0 | HuggingFace |
| ssg1/doc-compass (router TF-IDF) | Clasificacion lineal | No aplica | Limitado por vocabulario | No disponible en la ficha | Apache 2.0 | HuggingFace (joblib) |
| distilbert/distilroberta-base | Encoder base preentrenado | Aproximadamente 82 M | 512 posiciones | No aplica (modelo base sin ajuste) | Apache 2.0 (segun su ficha) | HuggingFace |

No se dispone de informacion sobre otros modelos comparables especificos de routing sanitario en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles y entrenado con comentarios de una sola frase: puede fallar de forma confiada ante textos mas largos o con redacciones no cubiertas por el conjunto publico. La propia ficha cita el error "my gums bleed when I brush" enrutado incorrectamente a Ginecologia-Obstetricia.
- No esta validado clinicamente y no constituye consejo medico; no debe usarse para diagnostico.
- La verificacion de emergencias se basa en una lista corta de reglas escritas y puede no detectar urgencias formuladas de maneras no previstas. En caso de emergencia, la ficha remite al 911.
- Riesgo de alucinacion no aplica en el sentido generativo (no genera texto), pero existe riesgo de clasificaciones erroneas con alta confianza.
- No se declaran sesgos especificos, aunque al derivarse de comentarios de pacientes de un unico conjunto publico puede heredar los sesgos de esa fuente.
- El proyecto esta en fase "Stage 1"; el sistema completo puede estar incompleto o en desarrollo.
- Licencia Apache 2.0, que permite uso comercial, pero la ausencia de validacion clinica desaconseja cualquier despliegue sanitario real sin supervision profesional.
- Cero descargas y cero valoraciones en el momento de la consulta, lo que limita el contraste independiente de su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssg1/doc-compass
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Conjunto de datos *Patient Comments and Specialist Types* (Mendeley Data): https://doi.org/10.17632/2twgjzpn82.2
