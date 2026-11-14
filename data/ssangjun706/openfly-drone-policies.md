# ssangjun706/openfly-drone-policies

## Resumen

`openfly-drone-policies` es una colección de checkpoints de políticas de navegación aérea publicada por el usuario ssangjun706 en Hugging Face. No se trata de un modelo de lenguaje al uso, sino de un conjunto de pesos de robótica derivados de dos backends distintos: pi0.5 (del proyecto OpenPI) y GR00T N1.7 (de NVIDIA), ambos ajustados finos (*fine-tuned*) sobre el split de entrenamiento del conjunto OpenFly de navegación visual-lenguaje aérea (aerial VLN). El repositorio actúa como un catálogo de políticas empaquetadas en bundles autocontenidos por experimento.

Cada carpeta `<backend>/<experiment>/` es un paquete autodescriptivo: un fichero `drone_bundle.json` declara el contrato de acciones, el commit del código de entrenamiento y el SHA-256 de cada fichero, lo que facilita la reproducibilidad y la auditoría de los artefactos. La revisión exacta evaluada para cada bundle se registra en el `configs/model_registry.json` del repositorio de código asociado (github.com/ssangjun706/Drone).

El interés del artefacto es acotado pero específico: sirve como referencia para investigadores que trabajan en navegación de drones guiada por instrucciones en lenguaje natural y quieren comparar o reutilizar políticas basadas en modelos fundacionales de robótica (pi0.5, GR00T N1.7). El autor advierte explícitamente de que son checkpoints de investigación y no software de vuelo. El repositorio ocupa 12,4 GB y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas de robótica derivadas de pi0.5 (OpenPI) y GR00T N1.7 (NVIDIA); arquitectura interna de cada backend no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (los pesos upstream conservan sus propios términos: Gemma para OpenPI pi0.5, NVIDIA GR00T N1.7 y Cosmos-Reason2) |
| Formato de pesos | no disponible (bundles con `drone_bundle.json` y verificación SHA-256 por fichero) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de los backends; se limita a indicar que se trata de políticas pi0.5 (OpenPI) y GR00T N1.7 (NVIDIA) sometidas a *fine-tuning* sobre el split de entrenamiento de OpenFly, un conjunto de navegación visual-lenguaje aérea. No se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento.

La innovación técnica destacable no está en el modelo en sí, sino en el formato de empaquetado: cada bundle incluye un `drone_bundle.json` que describe el contrato de acciones (el espacio de acciones que la política emite), el commit del código de entrenamiento y el hash SHA-256 de cada fichero. Esto permite verificar la integridad de los artefactos y rastrear exactamente qué revisión se evaluó, algo poco habitual en repositorios de políticas de robótica.

## Capacidades

- Navegación aérea guiada por visión y lenguaje (aerial VLN): las políticas están entrenadas para producir acciones de control de dron a partir de observaciones visuales e instrucciones en lenguaje natural.
- Emisión de acciones motrices según el contrato de acciones declarado en cada bundle.
- Dos familias de políticas alternativas (pi0.5 y GR00T N1.7) para el mismo dominio, lo que permite comparación entre backends.
- Verificación de integridad de artefactos mediante hashes SHA-256 por fichero.
- No se documentan capacidades de *tool calling*, agentes multi-paso, multilingüismo ni modos de razonamiento explícito; son políticas de control, no asistentes conversacionales.

## Casos de uso

- Investigación en navegación aérea visual-lenguaje: usar los checkpoints como línea base reproducible para comparar nuevas políticas sobre el split de OpenFly, apoyándose en el registro de revisiones del `model_registry.json`.
- Reproducción de experimentos: el `drone_bundle.json` con el commit de entrenamiento y los hashes permite reconstruir exactamente el artefacto evaluado en un paper o informe interno.
- Evaluación comparativa de backends fundacionales de robótica: confrontar pi0.5 frente a GR00T N1.7 en la misma tarea de navegación de dron bajo idéntico protocolo.
- Estudio de *fine-tuning* de modelos fundacionales en dominios de control: analizar cómo se transfieren representaciones de modelos generalistas a un dominio tan específico como el vuelo.
- Docencia y formación en robótica: servir de ejemplo práctico de empaquetado reproducible de políticas y de contratos de acciones en pipelines de investigación.
- Punto de partida para desarrollo posterior: reutilizar los pesos como inicialización para nuevas campañas de ajuste fino en simulación, siempre respetando los términos upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (12,4 GB) incluye varios bundles, no un único conjunto de pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño de cada política individual.
- Opciones de despliegue: no se documentan en la model card; el despliegue depende del stack de OpenPI y de NVIDIA GR00T N1.7, no de runtimes de LLM convencionales como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openfly-drone-policies | Políticas de navegación (pi0.5, GR00T N1.7) | Aerial VLN | no disponible | other | Hugging Face, 0 descargas |
| OpenPI pi0.5 (base) | Política fundacional de robótica | Robótica general | no disponible | Términos Gemma | Upstream público |
| NVIDIA GR00T N1.7 (base) | Política fundacional de robótica | Robótica humanoide/general | no disponible | Términos NVIDIA | Upstream público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que son checkpoints de investigación y no software de vuelo; no deben usarse en operaciones reales sin validación adicional.
- La licencia es "other" y los pesos upstream conservan sus propios términos (Gemma para OpenPI pi0.5, NVIDIA GR00T N1.7 y Cosmos-Reason2), lo que impone restricciones adicionales para uso comercial que deben revisarse caso por caso.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser políticas de control, el riesgo se manifiesta como acciones incorrectas, no como texto erróneo.
- No hay información sobre idiomas soportados ni sobre robustez ante instrucciones en distintos idiomas.
- El repositorio no registra descargas ni *likes*, por lo que no hay evidencia de validación por parte de la comunidad.
- El tamaño del repositorio (12,4 GB) y la ausencia de especificaciones de cuantización dificultan planificar el despliegue en hardware concreto.
- No se especifica el número de parámetros ni el contexto de cada política, lo que impide estimar requisitos de memoria con precisión.

## Enlaces

- Hugging Face: https://huggingface.co/ssangjun706/openfly-drone-policies
- Repositorio de código asociado: https://github.com/ssangjun706/Drone
- OpenPI (proyecto upstream de pi0.5): no disponible en la información proporcionada
- NVIDIA GR00T N1.7: no disponible en la información proporcionada
- Conjunto OpenFly: no disponible en la información proporcionada
