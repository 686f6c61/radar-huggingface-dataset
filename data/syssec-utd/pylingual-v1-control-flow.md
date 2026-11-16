# syssec-utd/pylingual-v1-control-flow

## Resumen

`pylingual-v1-control-flow` es un modelo compacto de 5,1 millones de parámetros desarrollado por el grupo SysSec de la Universidad de Texas en Dallas (UTD) como componente del descompilador de Python PyLingual. Su función es específica y acotada: recibe las sentencias ya traducidas de un *code object* de CPython junto con su bytecode y predice cómo se anidan esas sentencias, generando un esqueleto de flujo de control del estilo `<s0> { <s1> } else { <s2> }`. No es un modelo de lenguaje generalista, sino un modelo de transición entrenado para una única tarea dentro de un pipeline de descompilación.

La relevancia del modelo radica en que un único checkpoint cubre Python 3.6 hasta 3.15, lo que evita mantener un modelo por versión del intérprete. La arquitectura combina un codificador transformer de 4 capas (d_model 256, 8 cabezas) con un decodificador LSTM de 2 capas que emite acciones de anidamiento apuntando a sentencias concretas. Un autómata de pila que codifica la gramática de bloques de Python enmascara las acciones durante la decodificación, garantizando que todo esqueleto generado se renderice a código fuente compilable.

El modelo se publica con licencia GPL-3.0, pesa menos de 1 MB en el repositorio y se carga mediante la clase `TransitionModel` de PyLingual, no con `AutoModel` de transformers. En el split de test reservado, la reconstrucción greedy del esqueleto coincide con el del código fuente original en el 95,5 % de los *code objects*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (4 capas, d_model 256, 8 cabezas) + decodificador LSTM (2 capas) |
| Parametros totales | 5.118.492 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo especifico de codigo Python) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un modelo de transición secuencial: un codificador transformer de 4 capas con dimensión de modelo 256 y 8 cabezas de atención procesa las sentencias traducidas del *code object*, y un decodificador LSTM de 2 capas genera la secuencia de acciones de anidamiento una a una, apuntando a sentencias mediante punteros. La innovación técnica principal es la integración de un autómata de pila que modela la gramática de bloques de Python (`block_grammar.py`), que enmascara en cada paso las acciones inválidas. Esto restringe el espacio de búsqueda y asegura que cualquier esqueleto producido se pueda renderizar a fuente que compile.

El entrenamiento utilizó los *code objects* de las 150.000 fuentes del corpus de los modelos de traducción de PyLingual v1 (15.000 por versión: 13.500 de PyPI y 1.500 de CodeSearchNet), cada fuente compilada para una versión concreta y etiquetada con el esqueleto de su código original, conservándose solo los casos que recompilaban a bytecode equivalente. Se entrenó durante 48 épocas con tasa de aprendizaje 1e-3, schedule coseno, hasta 64 *code objects* por lote y semilla 42, alcanzando una pérdida de validación de 0,0095.

## Capacidades

- Predicción de anidamiento de sentencias: genera esqueletos de flujo de control (`if`/`else`, bucles, `try`/`except`, `with`, etc.) a partir de sentencias y bytecode.
- Cobertura multi-versión: un único modelo sirve para Python 3.6 hasta 3.15.
- Garantía de compilabilidad: el enmascaramiento mediante autómata de pila asegura que el esqueleto generado se renderiza a fuente compilable.
- Punteros a sentencias: las acciones de decodificación referencian sentencias concretas de la entrada, no texto libre.
- Integración en pipeline: diseñado para encadenarse tras la etapa de traducción de sentencias de PyLingual.
- No soporta tool calling, function calling, razonamiento multi-paso general, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Descompilación de bytecode Python en produccion: el modelo se integra en PyLingual para reconstruir la estructura de control de funciones compiladas, permitiendo recuperar código fuente legible de binarios `.pyc` en tareas de ingeniería inversa y análisis de malware.
- Analisis de seguridad de paquetes PyPI: al descompilar ruedas y paquetes sin fuente, el modelo ayuda a reconstruir la lógica de control de código sospechoso para auditoría.
- Forense de incidentes: recuperación de la estructura de scripts Python ofuscados o sin código fuente a partir de sus `.pyc`, con esqueletos que compilan y pueden revisarse manualmente.
- Investigacion en descompilacion: sirve como componente reproducible y de pequeño tamaño para experimentar con reconstrucción de flujo de control y comparar con enfoques basados en reglas.
- Mantenimiento de pipelines multi-versión: al cubrir de 3.6 a 3.15, un solo checkpoint simplifica el despliegue en entornos que analizan artefactos de distintas versiones del intérprete.
- Educacion y docencia: permite mostrar de forma tangible cómo se representa el flujo de control en bytecode y cómo un modelo secuencial con restricciones gramaticales puede reconstruirlo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión de esqueleto greedy en test reservado (coincidencia exacta con la fuente) | 95,5 % |
| Pérdida de validación | 0,0095 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 5,1 M de parámetros en fp32 el peso ronda los 20 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas por lotes moderadas.
- Opciones de despliegue: carga mediante la clase `TransitionModel` de PyLingual; no es compatible con `AutoModel`, vLLM, TGI ni Ollama. El decodificador LSTM y el enmascaramiento por autómata requieren el código del repositorio de PyLingual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pylingual-v1-control-flow | 5,1 M | no disponible | Reconstrucción de flujo de control en descompilación Python | GPL-3.0 | Hugging Face |
| PyLingual (descompilador completo) | no disponible | no disponible | Descompilación Python extremo a extremo | no disponible | GitHub |
| Decompiladores basados en reglas (p. ej. uncompyle6, decompyle3) | no aplica | no aplica | Descompilación Python por versiones | varía | PyPI |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice esqueletos de flujo de control; no genera código, no traduce sentencias ni funciona como modelo de lenguaje.
- Dependencia del ecosistema PyLingual: requiere su clase `TransitionModel` y el autómata de bloques; no se puede cargar con `AutoModel` ni con runtimes genéricos.
- Precisión no perfecta: un 4,5 % de los *code objects* del test no obtienen el esqueleto exacto en decodificación greedy, lo que puede requerir corrección posterior.
- Cobertura limitada a Python 3.6-3.15: versiones fuera de ese rango no están garantizadas.
- Licencia GPL-3.0: el uso comercial queda sujeto a las obligaciones de copyleft de la GPL, lo que puede condicionar su integración en productos propietarios.
- Riesgo de alucinación estructural: aunque el autómata garantiza compilabilidad, el esqueleto puede ser sintácticamente válido pero semánticamente distinto del original.
- Sin datos publicados sobre sesgos, idiomas naturales ni comportamiento fuera del dominio de bytecode Python.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez de adopción aún no demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-v1-control-flow
- Repositorio PyLingual: https://github.com/syssec-utd/pylingual
- Paper relacionado (corrección de salida de descompiladores, CCS 2025): https://softsec.kaist.ac.kr/~sangkilc/papers/wiedemeier-ccs25.pdf
