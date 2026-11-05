# STORMResearch/RawMod

## Resumen

RawMod es un modelo preentrenado para la detección de modificaciones de bases del ADN directamente a partir de señales crudas de secuenciación por nanoporos. Lo desarrolla el grupo STORMResearch y aborda un problema clásico en epigenética: identificar bases modificadas (5mC, 5hmC, 6mA, 4mC y 5hmU) sin necesidad de disponer de una muestra control sin modificar. Se trata de un modelo de dominio específico, no de un modelo de lenguaje, y su relevancia radica en que unifica la detección de cinco tipos de modificación en un único modelo agnóstico al tipo de modificación.

A diferencia de los detectores tradicionales, que requieren entrenamiento específico por modificación y una muestra de control pareada, RawMod opera sobre acumulaciones de señal (*pileups*) de nanoporos y generaliza entre tipos de modificación. El modelo es extremadamente compacto: 230.697 parámetros en una única arquitectura compartida por todos los checkpoints publicados. No es un transformer generativo ni un modelo multimodal en el sentido habitual; es una red neuronal especializada en clasificación de señal.

La publicación está en revisión y el repositorio de HuggingFace contiene únicamente los pesos (diccionarios de estado de PyTorch) junto con los checksums. El código, la instalación y la documentación completa residen en el repositorio de GitHub del grupo. La licencia GPL-3.0 condiciona su uso en productos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (red neuronal para clasificación de señal de nanoporos; pesos en PyTorch) |
| Parámetros totales | 230.697 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre *pileups* de señal, no sobre secuencias de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch state dictionary (`.pt`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que todos los checkpoints comparten una única arquitectura de 230.697 parámetros y que se distribuyen como diccionarios de estado de PyTorch. El modelo procesa *pileups* de señal cruda de nanoporos para detectar bases modificadas. El diseño es agnóstico al tipo de modificación: un mismo modelo cubre 5mC, 5hmC, 6mA, 4mC y 5hmU, y no requiere una muestra de control sin modificar para la inferencia.

El repositorio incluye varios conjuntos de checkpoints con fines de evaluación: `region_holdout/` contiene modelos entrenados excluyendo una región de cada genoma (con variantes `loco_<mod>.pt` que además excluyen un tipo de modificación, y `seeds/` con dos semillas de entrenamiento adicionales); `leaveout/` contiene modelos entrenados excluyendo un organismo o una librería, usados en el benchmark suplementario de *leave-out*. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Detección de 5-metilcitosina (5mC) en señal cruda de nanoporos.
- Detección de 5-hidroximetilcitosina (5hmC).
- Detección de N6-metiladenina (6mA).
- Detección de 4-metilcitosina (4mC).
- Detección de 5-hidroximetiluracilo (5hmU).
- Funcionamiento sin muestra de control sin modificar (*unmodified control*).
- Modelo agnóstico al tipo de modificación: una sola arquitectura para las cinco modificaciones.
- Evaluación mediante esquemas de retención de región, organismo y librería.
- No dispone de soporte de *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Análisis epigenético de metilación en ADN: el modelo puntúa directamente *pileups* de señal de nanoporos para identificar 5mC sin necesidad de una muestra pareada sin modificar, lo que simplifica el diseño experimental en estudios de metilación.
- Detección de hidroximetilación (5hmC): permite distinguir 5hmC de 5mC en la misma corrida de secuenciación, útil en estudios de reprogramación celular y neurociencia.
- Perfilado de 6mA en genomas bacterianos: adecuado para estudios de epigenética procariota donde las modificaciones de adenina son relevantes.
- Detección de 4mC y 5hmU en contextos específicos: cubre modificaciones menos frecuentes con el mismo modelo, evitando entrenar detectores dedicados.
- Validación cruzada de llamadas de modificación: los checkpoints de `region_holdout/` y `leaveout/` permiten reproducir los benchmarks del paper y evaluar la generalización del modelo a regiones, organismos y librerías no vistas.
- Integración en pipelines bioinformáticos: al ser un modelo PyTorch compacto (230.697 parámetros), puede ejecutarse en CPU o GPU modesta dentro de flujos de análisis de nanoporos existentes, siempre que se use el código del repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las cifras de precisión del paper (en revisión) y a los checkpoints de `region_holdout/` y `leaveout/` para su reproducción, pero no incluye tablas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 230.697 parámetros, el modelo ocupa del orden de 1 MB en precisión de 32 bits, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA para PyTorch es suficiente. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX, RTX, etc.) e incluso en CPU.
- Opciones de despliegue: inferencia mediante PyTorch con el código del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de modificaciones de ADN desde señal de nanoporos, ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un modelo de lenguaje ni un modelo generativo; no debe evaluarse con métricas de NLP.
- Licencia GPL-3.0: el uso comercial en productos propietarios queda condicionado por las obligaciones de copyleft de esta licencia.
- Paper en revisión: los resultados de precisión no están publicados formalmente y deben citarse mediante el repositorio de GitHub hasta su publicación.
- Dependencia del código externo: los pesos son diccionarios de estado de PyTorch y requieren el código del repositorio de GitHub para su uso; no hay pipeline de HuggingFace disponible.
- Sin datos sobre sesgos, tasas de alucinación (no aplica) ni comportamiento fuera de las condiciones de entrenamiento más allá de los benchmarks de retención publicados.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción todavía muy limitada.
- No se documentan limitaciones de contexto ni de idioma por no ser un modelo lingüístico; las limitaciones biológicas (tipos de modificación, organismos y librerías cubiertos) deben consultarse en el paper y el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/STORMResearch/RawMod
- GitHub (código, instalación y documentación): https://github.com/STORMgroup/RawMod
