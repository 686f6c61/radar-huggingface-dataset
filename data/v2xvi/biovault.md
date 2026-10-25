# v2xvi/biovault

## Resumen

BioVault (repositorio `v2xvi/biovault`) no es un modelo de lenguaje ni un modelo generativo: es un marco de deteccion de amenazas ciberneticas para el Internet de las Cosas Medicas (IoMT) basado en aprendizaje federado (FL) y descenso de gradiente estocastico con privacidad diferencial (DP-SGD). Lo desarrolla el usuario `v2xvi` y su proposito es permitir que varios hospitales entrenen de forma colaborativa un clasificador de trafico de red malicioso sin centralizar registros clinicos ni informacion de salud protegida (PHI), algo que la normativa HIPAA restringe explicitamente.

La relevancia del proyecto esta en el planteamiento: en lugar de agregar telemetria de dispositivos medicos (bombas de infusion, ventiladores, monitores, PACS) en un repositorio central, cada silo hospitalario entrena localmente con Opacus, recorta los gradientes por muestra a una norma L2 de 1.0, inyecta ruido gaussiano calibrado y envia solo deltas de pesos perturbados a un coordinador Flower que aplica FedAvg. El resultado es un clasificador global de cinco clases (BENIGN, DDOS, RANSOMWARE, DATA_TAMPERING, OTHER) con una garantia formal de privacidad objetivo (epsilon = 3.0, delta = 1e-5).

Ahora bien, la ficha debe leerse con cautela: el repositorio de HuggingFace tiene un tamano de 0.0 GB, no declara licencia, idiomas ni pipeline, y acumula 0 descargas y 0 likes. La model card describe la arquitectura y el esquema de privacidad, pero no publica pesos, codigo, metricas ni la arquitectura concreta del clasificador subyacente; ademas, el texto disponible aparece truncado en la seccion de configuracion del presupuesto de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendizaje federado (Flower, FedAvg con agregacion segura) + DP-SGD (Opacus) sobre un clasificador de intrusiones no especificado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE; la arquitectura del clasificador no se detalla) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | no disponible (tamano del repositorio: 0.0 GB, sin artefactos publicados) |
| Framework de FL | Flower (`flwr`) 1.9 o superior |
| Framework de privacidad | Opacus 1.4 o superior |
| Entorno de ejecucion | Python 3.10 o superior |
| Presupuesto de privacidad objetivo | epsilon = 3.0, delta = 1e-5 (composicion RDP entre rondas) |
| Mecanismo DP | Recorte por muestra con norma L2 C = 1.0 + ruido gaussiano N(0, sigma^2 C^2 I) |
| Taxonomia de salida | 5 clases: BENIGN (0), DDOS (1), RANSOMWARE (2), DATA_TAMPERING (3), OTHER (4) |
| Batch size local indicado | 256 |
| Fecha de creacion / actualizacion | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

El diseno es de dos niveles. En el nivel local, cada nodo hospitalario carga sus flujos de red IoMT con un DataLoader de batch 256 y entrena con Opacus aplicando privacidad diferencial a nivel de muestra: cada gradiente individual se recorta a una norma L2 maxima de 1.0 y se le suma ruido gaussiano calibrado antes del paso de descenso. En el nivel global, un coordinador Flower recibe los deltas de pesos ya perturbados, los agrega mediante FedAvg con agregacion segura y redistribuye los parametros del modelo global a los clientes en rondas de comunicacion predefinidas. La garantia se formaliza como (epsilon, delta)-privacidad diferencial con epsilon = 3.0 y delta = 1e-5, calculada mediante composicion de Renyi DP a lo largo de las rondas.

La model card no especifica la arquitectura interna del clasificador (numero de capas, dimensiones, si es una red densa, un modelo secuencial o un transformer), ni el volumen o la composicion del dataset de entrenamiento, ni si hubo etapas de ajuste posteriores. Tampoco se documenta el numero de rondas federadas, la tasa de muestreo por ronda ni el valor de sigma empleado, parametros imprescindibles para reproducir el calculo real del presupuesto de privacidad: la tabla de configuracion del presupuesto aparece cortada en el texto disponible. La innovacion tecnica declarada es, por tanto, el pipeline FL + DP-SGD y no una aportacion a nivel de arquitectura neuronal.

## Capacidades

- Clasificacion de trafico de red IoMT en cinco categorias: benigno, DDoS, ransomware, manipulacion de datos y otros vectores anomalos.
- Entrenamiento colaborativo entre instituciones sin intercambiar registros clinicos ni flujos de dispositivo en claro.
- Garantia formal de privacidad diferencial a nivel de muestra sobre los datos locales de cada cliente.
- Agregacion de deltas de modelo mediante FedAvg con agregacion segura en el coordinador.
- Deteccion pensada para ataques de dia cero dentro de la clase generica OTHER, junto a las clases especificas.
- Integracion como cliente o servidor Flower en infraestructuras Python 3.10+.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling, function calling ni flujos de agentes.
- No se documenta capacidad multilingue ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de audio.

## Casos de uso

- Deteccion distribuida de ransomware en un consorcio hospitalario: cada hospital entrena localmente patrones de cifrado masivo sobre su propia telemetria y comparte solo deltas perturbados, de modo que el modelo global aprende variantes observadas en otros centros sin que ningun registro clinico cruce la frontera institucional.
- Mitigacion de DDoS volumetrico contra gateways de telemetria medica: el clasificador etiqueta floods en tiempo de inferencia local, lo que permite activar reglas de filtrado en el borde de la red del hospital sin depender de un servicio centralizado.
- Deteccion de manipulacion de parametros de dosis o constantes vitales: la clase DATA_TAMPERING permite señalar alteraciones de integridad en flujos de bombas de infusion y monitores, un escenario donde la deteccion temprana tiene impacto clinico directo.
- Cumplimiento HIPAA en analitica de seguridad multi-centro: el esquema evita agregar PHI y apoya la justificacion de de-identificacion estadistica gracias al bound delta = 1e-5, lo que facilita acuerdos de tratamiento de datos entre hospitales y proveedores.
- Triaje de trafico anomalo no catalogado: la clase OTHER actua como contenedor para sondas de protocolo y vectores desconocidos, util como primera capa de alerta que derive el caso a analisis humano.
- Reproduccion academica de pipelines FL + DP: el stack Flower + Opacus descrito sirve como referencia para experimentos sobre el compromiso entre utilidad del clasificador y epsilon en entornos no IID.
- Despliegue en jurisdictions con silos regulatorios: hospitales de distintos paises o redes regionales pueden participar en el entrenamiento sin compartir logs, lo que simplifica la revision legal frente a una arquitectura centralizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de exactitud, precision, recall, F1, AUC ni tasas de falsos positivos para ninguna de las cinco clases, ni comparaciones con detectores de intrusiones centralizados. Tampoco se documentan curvas de utilidad frente a epsilon, ni el coste de comunicacion por ronda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende por completo de la arquitectura del clasificador, que no se especifica y cuyos pesos no estan publicados.
- Memoria durante el entrenamiento: DP-SGD con Opacus calcula gradientes por muestra, lo que incrementa el consumo de memoria respecto a un entrenamiento convencional con el mismo batch; con batch 256 el overhead puede ser determinante. No hay cifras publicadas para este proyecto.
- GPU recomendadas: no disponible. Al tratarse de un clasificador tabular o secuencial de red, es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Cabe en GPU de consumo: no confirmado por el autor.
- Opciones de despliegue: cliente y servidor Flower (`flwr` 1.9+), con Opacus 1.4+ y Python 3.10+ en el lado del cliente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada, y la busqueda web no devolvio resultados tecnicos relacionados con BioVault ni con deteccion federada de amenazas IoMT. Los criterios con los que deberia compararse son: numero de parametros del clasificador, tamano de contexto o ventana de features, epsilon y delta alcanzados, numero de rondas federadas, F1 por clase, licencia y disponibilidad de pesos.

| Criterio | BioVault | Alternativa centralizada (IDS clasico) | FL sin privacidad diferencial |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto / features | no disponible | no disponible | no disponible |
| Privacidad formal | epsilon = 3.0, delta = 1e-5 (objetivo) | sin garantia formal | sin garantia formal |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad de pesos | no disponible (repo 0.0 GB) | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio tiene 0.0 GB: no hay evidencia de pesos, codigo ni artefactos descargables. Cualquier uso en produccion requeriria reimplementar el pipeline a partir de la descripcion.
- No se declara licencia. Sin licencia explicita no puede asumirse permiso de uso comercial, modificacion ni redistribucion; el riesgo legal es alto para un despliegue hospitalario.
- La afirmacion de alineacion con HIPAA es una declaracion del autor; no se aporta auditoria, certificacion ni evaluacion independiente.
- El texto de la model card esta truncado en la seccion de configuracion del presupuesto de privacidad, por lo que faltan sigma, numero de rondas y tasa de muestreo, parametros necesarios para verificar el epsilon declarado.
- La privacidad diferencial con ruido calibrado tiende a degradar la deteccion de clases minoritarias; con cinco clases y previsible desbalance (RANSOMWARE y DATA_TAMPERING suelen ser escasas), el recall de las clases criticas es el primer aspecto a validar.
- Los datos hospitalarios son intrinsecamente no IID; FedAvg puede converger de forma inestable cuando la distribucion de trafico difiere entre centros.
- El esquema descrito incluye agregacion segura, pero no se documenta agregacion robusta frente a clientes maliciosos; un nodo comprometido podria intentar envenenar el modelo global.
- La clase OTHER agrupa vectores de dia cero y anomalias diversas, lo que limita la granularidad de la respuesta y favorece falsos positivos heterogeneos.
- No es un modelo generativo: no admite prompts, no procesa lenguaje natural y no dispone de ventana de contexto; cualquier expectativa de uso como LLM es erronea.
- No se documentan sesgos, idiomas ni dominios de aplicacion fuera de IoMT; extrapolar su uso a otros entornos de red no esta respaldado por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/v2xvi/biovault
- Flower (framework de aprendizaje federado): https://flower.ai/
- Opacus (DP-SGD): https://opacus.ai/
- Python 3.10+: https://www.python.org/downloads/
- HIPAA, Department of Health and Human Services: https://www.hhs.gov/hipaa/index.html
- La busqueda web realizada no devolvio resultados relevantes: unicamente enlaces a Netflix sin relacion con el proyecto, por lo que no hay papers, blogs ni demos adicionales que referenciar.
