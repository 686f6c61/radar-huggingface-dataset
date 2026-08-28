# yorklyb/npour

## Resumen

π₀.₅ (Pi05) es un modelo de política robótica de tipo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence, cuya implementación en LeRobot ha sido adaptada y publicada por Yibo Liu, investigador en Epson especializado en IA espacial y robótica. El modelo aborda uno de los problemas más complejos de la robótica actual: la generalización a entornos y situaciones no vistas durante el entrenamiento, superando las limitaciones de las políticas entrenadas para entornos controlados.

La arquitectura combina procesamiento de visión, lenguaje y acción en un único modelo entrenado con datos de demostración robótica. Con aproximadamente 4.140 millones de parámetros y un tamaño de repositorio de 9,4 GB en formato safetensors, el modelo se distribuye bajo licencia Apache-2.0. La implementación se apoya en el ecosistema LeRobot de Hugging Face, lo que facilita su uso tanto para entrenamiento como para inferencia en robots reales.

La relevancia de este lanzamiento radica en que acerca un modelo de última generación de VLA al ecosistema open source, permitiendo a la comunidad investigadora y a desarrolladores de robótica experimentar con políticas de mundo abierto sin depender de infraestructuras propietarias. El modelo se publicó el 28 de agosto de 2026 y aún no acumula descargas ni valoraciones en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en el modelo π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de tipo Vision-Language-Action que integra percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones motoras en una unica red. La implementacion publicada en este repositorio procede de la adaptacion del repositorio open source OpenPI de Physical Intelligence al ecosistema LeRobot de Hugging Face. El modelo representa una evolucion significativa respecto a su predecesor π₀, con un enfoque especifico en la generalizacion a entornos completamente nuevos.

Los detalles concretos sobre la arquitectura interna (tipo de transformer, mecanismos de atencion, fusion de modalidades) no estan disponibles en la informacion publicada. El entrenamiento se ha realizado siguiendo el pipeline de LeRobot, que permite entrenar politicas a partir de datasets de demostracion robótica. El dataset asociado al modelo se denomina "npour", aunque no se proporcionan detalles sobre su composicion, numero de episodios ni metodologia de recopilacion. No se menciona si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo adicional.

## Capacidades

- Generacion de politicas de accion para robots: el modelo genera directamente comandos motores a partir de observaciones visuales e instrucciones de alto nivel.
- Generalizacion a entornos no vistos: disenado especificamente para operar en situaciones y escenarios que no aparecieron durante el entrenamiento.
- Integracion vision-lenguaje-accion: combina las tres modalidades en un unico modelo sin modulos separados.
- Entrenamiento e inferencia mediante LeRobot: compatible con el ecosistema de Hugging Face para robotica, incluyendo herramientas de entrenamiento, evaluacion y registro de episodios.
- Soporte para multiples configuraciones de robot: el modelo se puede evaluar con distintos tipos de robot, como el SO100 follower mencionado en la documentacion.
- Capacidad de aprendizaje por imitacion: entrenado mediante demostraciones, puede replicar comportamientos observados en los datos de entrenamiento.

## Casos de uso

- Manipulacion robotica en entornos domesticos: el modelo puede controlar brazos roboticos para tareas como recoger objetos, abrir puertas o interactuar con electrodomesticos, aprovechando su capacidad de generalizacion a distribuciones de cocina o salon no vistas en entrenamiento.
- Automatizacion de laboratorios de investigacion: permite desplegar politicas VLA en entornos de investigacion donde las condiciones cambian frecuentemente, reduciendo la necesidad de reentrenamiento por cada variacion del setup experimental.
- Evaluacion comparativa de algoritmos de robotica: al estar disponible en LeRobot, sirve como baseline de referencia para comparar nuevas tecnicas de aprendizaje por imitacion o refuerzo en tareas de manipulacion.
- Desarrollo de robots de servicio en entornos comerciales: empresas de robotica pueden evaluar si la generalizacion de π₀.₅ permite reducir costes de recopilacion de datos especificos por cliente.
- Investigacion academica en VLA: grupos de investigacion pueden estudiar el comportamiento del modelo en tareas de open-world generalization y proponer mejoras sobre una base publica y reproducible.
- Formacion de politicas mediante aprendizaje por refuerzo: el modelo puede servir como punto de partida para fine-tuning con RL, aprovechando la infraestructura de LeRobot para iterar rapidamente sobre el checkpoint publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion en tareas de manipulacion, ni comparativas con otros modelos VLA como π₀, OpenVLA u otras politicas de robotica. Tampoco se proporcionan datos sobre tasa de exito en episodios de evaluacion, latencia de inferencia ni requisitos computacionales medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque con 4.140 millones de parametros en precision FP32 se requieren aproximadamente 16,6 GB solo para los pesos; con cuantizacion a FP16 o BF16 la cifra se reduce a unos 8,3 GB, asumiendo que el modelo sea cuantizable.
- GPU recomendadas: no se especifican en la documentacion. Por tamano, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100 40GB) seria necesaria para inferencia en precision nativa.
- Compatibilidad con GPU de consumo: probablemente viable en RTX 4090 (24 GB) con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta entrenamiento e inferencia en GPU NVIDIA mediante PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje generativo clasico sino una politica de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (este modelo) | 4,14 B | no disponible | VLA open-world | Apache-2.0 | Hugging Face (LeRobot) |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA | no disponible | Codigo abierto parcial (OpenPI) |
| OpenVLA | 7 B | no disponible | VLA | no disponible | Codigo abierto |

La comparativa es limitada porque no se dispone de datos de rendimiento publicados para este modelo. La principal diferencia con π₀ original es que esta version esta integrada en LeRobot y publicada bajo licencia Apache-2.0, lo que facilita su adopcion en proyectos open source. OpenVLA, por su parte, tiene mas parametros pero no esta claro que ofrezca el mismo nivel de generalizacion a entornos abiertos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion: no hay evidencia publica del rendimiento real del modelo en tareas de manipulacion, por lo que su eficacia en produccion es incierta.
- El dataset de entrenamiento "npour" no esta documentado: se desconoce la composicion, el tamano y la diversidad de los datos, lo que impide evaluar posibles sesgos o limitaciones de cobertura.
- Generalizacion no garantizada: aunque el modelo esta disenado para open-world generalization, no hay datos que confirmen su comportamiento en entornos reales no controlados.
- Sin informacion sobre idiomas: no se especifica que idiomas soporta el componente de lenguaje, lo que puede limitar su uso a ingles u otros idiomas mayoritarios.
- Riesgo de alucinacion de acciones: como todo modelo VLA, puede generar comandos motores incorrectos o inseguros en situaciones fuera de distribucion; es necesario implementar salvaguardas de seguridad en despliegues reales.
- Licencia Apache-2.0 permite uso comercial, pero el software subyacente (LeRobot, OpenPI) puede tener sus propias condiciones.
- Sin soporte de cuantizacion documentado: no se indica si los pesos pueden convertirse a GGUF, GPTQ u otros formatos optimizados, lo que limita las opciones de despliegue en hardware reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yorklyb/npour
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor en Hugging Face: https://huggingface.co/yorklyb
- Pagina personal de Yibo Liu: https://yorklyb.github.io/
- GitHub de Yibo Liu: https://github.com/yorklyb
